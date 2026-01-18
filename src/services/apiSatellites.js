import { apiFetch } from "./http";

export async function getSatellites() {
  try {
    const satellites = await apiFetch("/satellites");
    console.log(satellites);
    return await apiFetch("/satellites");
  } catch (err) {
    console.error(err);
    throw new Error("Could Not Read Satellites Data");
  }
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
    imagePath  = ""
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
