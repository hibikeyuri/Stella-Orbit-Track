import asyncio
from datetime import datetime, timezone

import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import celestrak_settings
from app.core.logging import get_logger
from app.database.models import TLE, Satellite
from app.database.session import engine
from app.schemas import TLECreate
from app.services.tle import TLEService

logger = get_logger(__name__)


def _parse_norad_id(line1: str) -> int | None:
    try:
        raw = line1.split()[1]
    except IndexError:
        return None

    digits = "".join(ch for ch in raw if ch.isdigit())
    return int(digits) if digits else None


def _parse_tle_text(text: str) -> list[dict]:
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    items: list[dict] = []

    i = 0
    while i + 2 < len(lines):
        name = lines[i]
        line1 = lines[i + 1]
        line2 = lines[i + 2]

        if not line1.startswith("1 ") or not line2.startswith("2 "):
            i += 1
            continue

        norad_id = _parse_norad_id(line1)
        if norad_id is None:
            i += 3
            continue

        items.append(
            {
                "name": name,
                "line1": line1,
                "line2": line2,
                "norad_id": norad_id,
            }
        )
        i += 3

    return items


async def _fetch_celestrak_tle() -> str:
    params = {
        "GROUP": celestrak_settings.CELESTRAK_GROUP,
        "FORMAT": celestrak_settings.CELESTRAK_FORMAT,
    }
    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.get(celestrak_settings.CELESTRAK_BASE_URL, params=params)
        resp.raise_for_status()
        return resp.text


async def _upsert_satellite(session: AsyncSession, payload: dict) -> Satellite:
    stmt = select(Satellite).where(Satellite.norad_id == payload["norad_id"])
    existing = await session.scalar(stmt)

    if existing:
        existing.name = payload["name"]
        existing.line1 = payload["line1"]
        existing.line2 = payload["line2"]
        existing.is_active = True
        session.add(existing)
        return existing

    satellite = Satellite(
        name=payload["name"],
        line1=payload["line1"],
        line2=payload["line2"],
        norad_id=payload["norad_id"],
        is_active=True,
        created_at=datetime.now(timezone.utc),
    )
    session.add(satellite)
    return satellite


async def sync_satellites_from_celestrak() -> int:
    """Fetch satellites from Celestrak and upsert into Satellite table."""
    tle_text = await _fetch_celestrak_tle()
    items = _parse_tle_text(tle_text)

    if not items:
        logger.warning("No TLE data fetched from Celestrak")
        return 0

    async with AsyncSession(engine) as session:
        for item in items:
            await _upsert_satellite(session, item)

        await session.commit()

    logger.info("Synced %s satellites from Celestrak", len(items))
    return len(items)


async def refresh_tle_history() -> int:
    """Upsert TLE records: update existing or insert new. Only one TLE per satellite."""
    async with AsyncSession(engine) as session:
        stmt = select(Satellite).where(
            Satellite.line1.is_not(None),
            Satellite.line2.is_not(None),
        )
        satellites = (await session.execute(stmt)).scalars().all()

        if not satellites:
            return 0

        snapshot = [
            {
                "id": sat.id,
                "name": sat.name,
                "line1": sat.line1,
                "line2": sat.line2,
            }
            for sat in satellites
        ]

        service = TLEService(session)
        upserted = 0
        for sat in snapshot:
            latest_stmt = (
                select(TLE)
                .where(TLE.satellite_id == sat["id"])
                .order_by(TLE.created_at.desc())
                .limit(1)
            )
            latest = await session.scalar(latest_stmt)

            # Skip if TLE data hasn't changed
            if latest and latest.line1 == sat["line1"] and latest.line2 == sat["line2"]:
                continue

            if latest:
                # Update existing TLE record in-place
                await service.upsert(latest, sat)
            else:
                # No TLE exists yet — insert a new one
                payload = TLECreate(
                    satellite_id=sat["id"],
                    name=sat["name"],
                    line1=sat["line1"],
                    line2=sat["line2"],
                )
                await service.add(payload)
            upserted += 1

        logger.info("Upserted %s TLE records", upserted)
        return upserted


async def _sleep_until(stop_event: asyncio.Event, seconds: int) -> None:
    try:
        await asyncio.wait_for(stop_event.wait(), timeout=seconds)
    except asyncio.TimeoutError:
        return


async def run_satellite_sync(stop_event: asyncio.Event) -> None:
    while not stop_event.is_set():
        try:
            await sync_satellites_from_celestrak()
        except Exception:
            logger.exception("Satellite sync failed")

        await _sleep_until(
            stop_event, celestrak_settings.SATELLITE_SYNC_INTERVAL_SECONDS
        )


async def run_tle_refresh(stop_event: asyncio.Event) -> None:
    while not stop_event.is_set():
        try:
            await refresh_tle_history()
        except Exception:
            logger.exception("TLE refresh failed")

        await _sleep_until(stop_event, celestrak_settings.TLE_REFRESH_INTERVAL_SECONDS)


async def start_scheduler(app) -> None:
    stop_event = asyncio.Event()
    app.state.scheduler_stop = stop_event
    app.state.scheduler_tasks = [
        asyncio.create_task(run_satellite_sync(stop_event)),
        asyncio.create_task(run_tle_refresh(stop_event)),
    ]


async def stop_scheduler(app) -> None:
    stop_event: asyncio.Event = app.state.scheduler_stop
    stop_event.set()

    tasks = app.state.scheduler_tasks
    for task in tasks:
        task.cancel()

    await asyncio.gather(*tasks, return_exceptions=True)
