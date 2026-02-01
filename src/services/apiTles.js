import { apiFetch } from "./http";

function applyFilter(data, filter) {
  if (!filter || filter.value === "all") return data;
  const field = filter.field;
  const R_EARTH = 6371;
  const LEO_MAX = R_EARTH + 2000;
  const MEO_MAX = R_EARTH + 35786;

  return data.filter((item) => {
    const value = Number(item?.[field]);
    if (Number.isNaN(value)) return false;
    if (filter.value === "leo") return value < LEO_MAX;
    if (filter.value === "meo") return value >= LEO_MAX && value < MEO_MAX;
    if (filter.value === "geo") return value >= MEO_MAX;
    return true;
  });
}

function applySort(data, sortBy) {
  if (!sortBy) return data;
  const { field, direction } = sortBy;

  return [...data].sort((a, b) => {
    const aVal = a?.[field];
    const bVal = b?.[field];

    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return 1;
    if (bVal == null) return -1;

    if (typeof aVal === "string" || typeof bVal === "string") {
      const result = String(aVal).localeCompare(String(bVal));
      return direction === "asc" ? result : -result;
    }

    const result = Number(aVal) - Number(bVal);
    return direction === "asc" ? result : -result;
  });
}

export async function getTles({ filter, sortBy, page = 1, pageSize = 10 }) {
  const validPageSize = Number(pageSize) > 0 ? Number(pageSize) : 10;

  const tles = await apiFetch("/tle");

  const filtered = applyFilter(tles, filter);
  const sorted = applySort(filtered, sortBy);

  const totalCount = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / validPageSize));
  const suggestedPage = page > 0 && page <= totalPages ? page : totalPages;

  const from = (suggestedPage - 1) * validPageSize;
  const to = from + validPageSize;
  const paged = sorted.slice(from, to);

  return {
    tles: paged,
    count: totalCount,
    page: suggestedPage,
    pageSize: validPageSize,
    totalPages,
  };
}

export async function getTle(id) {
  const list = await apiFetch(`/tle/satellite/${id}`);
  if (!Array.isArray(list) || list.length === 0) {
    throw new Error("Tle Data Not Found");
  }

  return [...list].sort((a, b) => {
    const aTime = new Date(a.created_at).getTime();
    const bTime = new Date(b.created_at).getTime();
    return bTime - aTime;
  })[0];
}
