# Changelog

All notable changes to Stella Orbit Track are documented below.

---

## 2026-03-24

### Security

- **Remove tracked sensitive files** — purged `sqlite.db`, `schemas_old.py.bak`, and user uploads from repository and rewrote entire git history to eliminate all traces.
- **Update `.gitignore`** — added `*.db`, `*.sqlite`, `*.sqlite3`, `*.bak`, `backend/app/uploads/` patterns.

---

## 2026-03-23

### Frontend — RWD, Dark Mode & Theme

- **Responsive sidebar** — mobile-first grid (`md:grid-cols-[16rem_1fr]`), slide-in overlay with backdrop on small screens.
- **Dark mode toggle** — `useDarkMode` hook with `localStorage` persistence and system preference detection; sun/moon `DarkModeToggle` component.
- **Sidebar context** — extracted `useSidebar` context from `AppLayout` to a dedicated hook (`src/hooks/useSidebar.js`).
- **Hamburger menu** — `Header` shows a hamburger button on `md:hidden` breakpoint.
- **Reverse:1999 art-deco theme** — gold/brass brand color palette (`--color-brand-50` through `--color-brand-900`); deep-navy oklch-based dark mode palette (hue 280) in `GlobalStyle.css`.
- **Dark mode classes** — applied across `Table`, `Form`, `Heading`, `ProtectedRoute`, `MainNav`.

### Backend — Test Suite

- **51 tests passing** in `backend/tests/`:
  - `conftest.py` — `FakeSession` mock class and shared fixtures (`sample_line1`, `sample_line2`, `sample_satellite`, `sample_tle`, `sample_user`, `sample_setting`).
  - `test_tle_service.py` (13) — TLE line2 parsing, add, upsert, create from satellite, error cases.
  - `test_propagation_ext.py` (12) — coordinate transforms, SGP4 propagation, ground track, orbital decay estimation.
  - `test_core_and_schemas.py` (9) — structured logging setup, Pydantic schema validation.
  - `test_worker.py` (8) — `_parse_norad_id`, `_parse_tle_text` with edge cases.
  - `test_satellite_service.py` (6) — satellite CRUD, list, delete operations.
  - `test_propagation.py` (1) — basic SGP4 smoke test.

### Style

- Auto-format `UpdateSettingsForm`, `Account`, `UpdateUserDataForm`, `OAuthCallback`, `Login`, `mfa` pages.

---

## 2026-03-22

### Backend — Architecture Refactoring

- **Split schemas** — migrated monolithic `schemas.py` into `schemas/` package with per-domain files (`satellite.py`, `tle.py`, `user.py`, `settings.py`, `propagation.py`, `common.py`); backward-compatible re-exports in `__init__.py`.
- **Structured logging** — `core/logging.py` module (`setup_logging`, `get_logger`) with formatted output and silenced noisy libraries.
- **Redis improvements** — connection pool configuration, JWT blacklist optimizations.
- **Avatar upload** — `PATCH /user/me` endpoint with file upload support; `backend/app/uploads/` storage directory.
- **Email redirect** — configurable redirect URLs in verification and password reset templates.

### Frontend — Settings, Profile & OAuth Pages

- **Settings page revamp** — redesigned `UpdateSettingsForm` with improved validation.
- **User profile page** — avatar upload UI, username editing.
- **Email verify & OAuth pages** — polished layouts for `OAuthCallback`, `mfa`.

---

## 2026-03-01

### Features

- **Multi-satellite live tracker** — `GET /propagation/multi-position` endpoint; batch position polling on Leaflet map.
- **Sky plot** — `GET /propagation/sky-pass/{id}` endpoint; polar plot with azimuth/elevation track data.
- **Orbit comparison** — side-by-side orbital element comparison between satellites.
- **Orbital decay analysis** — `GET /propagation/decay/{id}` endpoint; lifetime estimation from B* drag parameter.
- **Conjunction analysis** — `GET /propagation/conjunction` endpoint; proximity alerts between two satellites with configurable threshold.

### Fixes

- **TLE field name mismatch** — corrected field names and added missing orbital parameters.

---

## 2026-02-25

### Fixes

- **Server-side pagination** — migrated from client-side slicing to proper server-side page/pageSize handling; accurate total count stats.
- **GMST rotation bug** — fixed orbit propagation Earth rotation calculation in backend.
- **Dashboard refactoring** — optimized chart rendering and data fetching.

---

## 2026-02-18

### Features

- **Satellite pagination** — ported TLE pagination pattern to satellite module.
  - `usePaginationParam` hook made generic with configurable `filterField` parameter.
  - `getSatellites()` rewritten with `applyFilter` / `applySort` / paginate logic.
  - `useSatellites` hook mirrors `useTles` with page prefetching.
  - `SatelliteTable` cleaned up — removed inline filter/sort, added `Paginations` component.

See [CHANGELOG-satellite-pagination.md](CHANGELOG-satellite-pagination.md) for detailed file-by-file breakdown.

---

## 2026-02-10

### Fixes

- Resolve TLE duplication, router double-mount, and delete not committing.
- Critical architecture issues from code review (4 fixes).

### Documentation

- Added system architecture diagrams, authentication flows, and SGP4 reference to README.

---

## 2026-02-01

### Features

- **TLE sync & propagation APIs** — CelesTrak sync scheduler, SGP4 propagation endpoints, simple tests.
- **Ground track API** — `GET /propagation/ground-track/{id}` endpoint with configurable time window and step size.

---

## 2026-01-20

### Features

- **MFA (TOTP)** — multi-factor authentication with pyotp; QR code setup flow; deferred `mfa_enabled` until TOTP code is verified.
- **OAuth login** — GitHub and Google OAuth providers; provider registry pattern; automatic user linking by email.

### Backend

- **Centralize config** — migrated to `pydantic-settings` (`config.py`); eliminated hardcoded URLs and credentials.
- **Removed hardcoded credentials** — all secrets moved to `.env` files.

---

## 2026-01-10

### Features

- **FastAPI migration** — migrated auth and user profile from Supabase to local FastAPI backend.
- **Satellite CRUD** — connected local FastAPI for satellite create/read/update/delete.
- **Satellite TLE & propagation** — orbital calculation functions, TLE detail page with real-time tracking on Leaflet map.

---

## 2025-12-20

### Features

- **Supabase auth** — session-based user authentication, authorization, and protected routes.
- **TLE detail page** — real-time satellite tracking with position polling.
- **Pagination** — API-side pagination with URL-based page navigation.
- **Filtering & sorting** — client-side filter component with Tabs integration; API-side sorting.
- **Compound components** — `Table`, `Modal`, `Menusv1` using compound pattern.
- **Settings module** — API settings provider and hooks (`useSettings`, `useUpdateSetting`).

### UI

- **Toast system** — context + provider pattern for unified notifications.
- **Modal system** — React portal, outside click handling, compound component pattern.

---

## 2025-12-01 — Initial Release

- Project scaffolding with Vite + React 19.
- Satellite table and data presentation.
- Delete functionality with toast integration.
- Image upload support for satellites.
- Dashboard page with mock data generator.
- shadcn/ui component library integration.
