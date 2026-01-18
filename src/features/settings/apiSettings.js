import { apiFetch } from "@/services/http";

export async function getSettings() {
  try {
    const data = await apiFetch("/settings", {
      method: "GET",
    });
    return data;
  } catch (err) {
    console.error("Settings could not be loaded:", err);
    throw new Error("Settings could not be loaded");
  }
}

export async function updateSettings(newSetting) {
  try {
    const data = await apiFetch("/settings/1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newSetting),
    });
    return data;
  } catch (err) {
    console.error("Settings could not be updated:", err);
    throw new Error("Settings could not be updated");
  }
}
