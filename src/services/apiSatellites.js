import { apiFetch } from "./http";

function applyFilter(data, filter) {
  if (!filter || filter.value === "all") return data;
  const field = filter.field;

  return data.filter((item) => {
    if (field === "is_active") {
      if (filter.value === "active") return item.is_active === true;
      if (filter.value === "non-active") return item.is_active === false;
    }
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

export async function getSatellites({
  filter,
  sortBy,
  page = 1,
  pageSize = 10,
} = {}) {
  const validPageSize = Number(pageSize) > 0 ? Number(pageSize) : 10;

  const satellites = await apiFetch("/satellites");

  const filtered = applyFilter(satellites, filter);
  const sorted = applySort(filtered, sortBy);

  const totalCount = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / validPageSize));
  const suggestedPage = page > 0 && page <= totalPages ? page : totalPages;

  const from = (suggestedPage - 1) * validPageSize;
  const to = from + validPageSize;
  const paged = sorted.slice(from, to);

  return {
    satellites: paged,
    count: totalCount,
    page: suggestedPage,
    pageSize: validPageSize,
    totalPages,
  };
}

async function uploadImage(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/upload/image`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("Image upload failed");
  return (await res.json()).url;
}

export async function createSatellites(satellite, id) {
  try {
    let imagePath = satellite.img;

    if (satellite.img instanceof File) {
      imagePath = await uploadImage(satellite.img);
    }
    imagePath = "";
    const payload = { ...satellite, img: imagePath };

    if (!id) {
      // CREATE
      return await apiFetch("/satellites/", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    }

    // UPDATE
    return await apiFetch(`/satellites/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error(err);
    throw new Error("Satellite could not be created or updated");
  }
}

export async function deleteSatellites(id) {
  try {
    return await apiFetch(`/satellites/${id}`, {
      method: "DELETE",
    });
  } catch (err) {
    console.error(err);
    throw new Error("Satellite could not be deleted");
  }
}
