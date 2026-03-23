import { apiFetch } from "./http";

export async function getTles({ filter, sortBy, page = 1, pageSize = 10 }) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("page_size", String(pageSize));

  if (filter?.field === "semi_major_axis" && filter?.value && filter.value !== "all") {
    params.set("orbit_type", filter.value);
  }

  if (sortBy?.field && sortBy?.direction) {
    params.set("sort_by", sortBy.field);
    params.set("sort_dir", sortBy.direction);
  }

  const res = await apiFetch(`/tle?${params.toString()}`);

  return {
    tles: res.data,
    count: res.total,
    page: res.page,
    pageSize: res.page_size,
    totalPages: res.total_pages,
  };
}

export async function getTle(id) {
  const res = await apiFetch(`/tle/satellite/${id}?page_size=200`);
  const list = res.data;
  if (!Array.isArray(list) || list.length === 0) {
    throw new Error("Tle Data Not Found");
  }

  return [...list].sort((a, b) => {
    const aTime = new Date(a.created_at).getTime();
    const bTime = new Date(b.created_at).getTime();
    return bTime - aTime;
  })[0];
}
