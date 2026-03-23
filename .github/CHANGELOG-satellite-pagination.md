# Satellite Pagination -- Changelog & Notes

> Date: 2026-02-18

## Background

The TLE module already had a complete frontend pagination flow (filter / sort / paginate).
The satellite module was still using the legacy pattern: fetch all -> filter/sort inline in the component, no pagination.
This change ports the TLE pagination pattern to the satellite module.

---

## Architecture Decision

- **Frontend pagination** (not backend).
- The backend `/satellites` endpoint returns the full list; slicing is done client-side.
- Same approach as `/tle` -- keeps both modules consistent.

---

## Files Changed

### 1. `src/hooks/usePaginationParam.js`

**What changed**: Added a third parameter `filterField` (default `"semi_major_axis"`) so that the hook is reusable for any filter field.

Before:

```js
export function usePaginationParams(pageSizeOptions, apiTotalPages)
// hardcoded: searchParams.get("semi_major_axis")
```

After:

```js
export function usePaginationParams(pageSizeOptions, apiTotalPages, filterField = "semi_major_axis")
// dynamic: searchParams.get(filterField)
```

Backward-compatible -- existing TLE callers don't pass `filterField`, so the default still works.

---

### 2. `src/services/apiSatellites.js`

**What changed**: Rewrote `getSatellites()` from a simple fetch to a paginated fetch with filter/sort/paginate logic.

Key points:

- `applyFilter` handles the `is_active` field (`active` / `non-active` / `all`).
- `applySort` is a generic comparator (same as TLE).
- Returns `{ satellites, count, page, pageSize, totalPages }` -- same shape as `getTles()`.
- Function signature changed to `getSatellites({ filter, sortBy, page, pageSize })`.
- Removed the duplicate `apiFetch` call and stray `console.log`.

---

### 3. `src/features/satellite/useSatellites.js`

**What changed**: Fully rewritten to mirror `useTles.js`.

- Uses `usePaginationParams([10,20,50,100], null, "is_active")`.
- Passes `{ filter, sortBy, page, pageSize }` to the API function.
- Prefetches `page+1` and `page-1` via `queryClient.prefetchQuery`.
- Returns `{ satellites, count, currentPage, pageSize, totalPages, ... }`.

---

### 4. `src/features/satellite/SatelliteTable.jsx`

**What changed**: Removed all inline filter/sort logic; now uses the data directly from `useSatellites()`.

Removed:

- `useSearchParams` manual filter parsing.
- `sortByField()` inline function.
- Unused imports (`clsx`, `AlertTriangle`, `Satellite`, `CreateSatelliteForm`, `ToastModal`, `Button`).
- Dead `TableHeader` component that was defined but never used externally.

Added:

- `<Paginations>` component in `<Table.Footer>`.
- Wrapped entire table in `<Menusv1>` (consistent with TLE).

---

### 5. `.gitignore`

Added `.github/` so this documentation folder is not tracked by git.

---

## Lessons Learned

1. The project uses a **frontend pagination** pattern -- the backend returns full collections, and the client-side `applyFilter` / `applySort` / `slice` handle everything. This is fine for small-to-medium datasets but will need backend pagination if data grows significantly.

2. `usePaginationParam.js` was originally tightly coupled to the TLE filter field. Making it accept `filterField` as a parameter makes it a truly generic hook -- any future module can reuse it.

3. Moving filter/sort logic out of the component and into the service layer keeps components clean and testable. The component only consumes pre-processed, paginated data.

4. The `SatelliteTable` had accumulated dead code (unused `TableHeader`, unused imports). Cleaning these out improves maintainability.
