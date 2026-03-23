import { apiFetch } from "./http";

export async function getSatellites({
  filter,
  sortBy,
  page = 1,
  pageSize = 10,
} = {}) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("page_size", String(pageSize));

  if (filter?.field === "is_active" && filter?.value) {
    if (filter.value === "active") params.set("is_active", "true");
    if (filter.value === "non-active") params.set("is_active", "false");
  }

  if (sortBy?.field && sortBy?.direction) {
    params.set("sort_by", sortBy.field);
    params.set("sort_dir", sortBy.direction);
  }

  const res = await apiFetch(`/satellites?${params.toString()}`);

  return {
    satellites: res.data,
    count: res.total,
    page: res.page,
    pageSize: res.page_size,
    totalPages: res.total_pages,
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
