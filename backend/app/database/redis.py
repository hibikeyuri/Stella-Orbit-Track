"""Redis connection with pooling and graceful fallback."""

from redis.asyncio import ConnectionPool, Redis

from app.config import app_settings
from app.core.logging import get_logger

logger = get_logger(__name__)

_pool = ConnectionPool(
    host=app_settings.REDIS_HOST,
    port=app_settings.REDIS_PORT,
    db=app_settings.REDIS_DB,
    max_connections=20,
    decode_responses=True,
)

_redis = Redis(connection_pool=_pool)

# 7-day TTL so blacklisted tokens don't persist forever
_BLACKLIST_TTL = 60 * 60 * 24 * 7


async def add_jti_to_blacklist(jti: str) -> None:
    try:
        await _redis.set(jti, "1", ex=_BLACKLIST_TTL)
    except Exception:
        logger.exception("Redis SET failed for jti=%s", jti)


async def is_jti_blacklisted(jti: str) -> bool:
    try:
        return bool(await _redis.exists(jti))
    except Exception:
        logger.exception("Redis EXISTS failed for jti=%s", jti)
        return False


async def redis_health() -> bool:
    """Return True if Redis is reachable."""
    try:
        return await _redis.ping()
    except Exception:
        return False


async def close_redis() -> None:
    await _redis.aclose()
    await _pool.aclose()
