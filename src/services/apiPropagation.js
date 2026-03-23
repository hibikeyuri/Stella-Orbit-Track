import { apiFetch } from "./http";

export async function getPropagationPosition(satelliteId, at) {
  const query = at ? `?at=${encodeURIComponent(at.toISOString())}` : "";
  return await apiFetch(`/propagation/position/${satelliteId}${query}`);
}

export async function getGroundTrack(satelliteId, minutes = 120, step = 30) {
  return await apiFetch(
    `/propagation/ground-track/${satelliteId}?minutes=${minutes}&step=${step}`,
  );
}

export async function getFlyover(satelliteId, lat, lon, duration = 1440) {
  return await apiFetch(
    `/propagation/flyover/${satelliteId}?lat=${lat}&lon=${lon}&duration=${duration}`,
  );
}
