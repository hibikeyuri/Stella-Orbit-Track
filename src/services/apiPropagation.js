import { apiFetch } from "./http";

export async function getPropagationPosition(satelliteId, at) {
  const query = at ? `?at=${encodeURIComponent(at.toISOString())}` : "";
  return await apiFetch(`/propagation/position/${satelliteId}${query}`);
}
