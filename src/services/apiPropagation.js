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

export async function getMultiPositions(ids, at) {
  const idsStr = ids.join(",");
  const query = at ? `&at=${encodeURIComponent(at.toISOString())}` : "";
  return await apiFetch(`/propagation/multi-position?ids=${idsStr}${query}`);
}

export async function getConjunction(satA, satB, hours = 24, threshold = 50) {
  return await apiFetch(
    `/propagation/conjunction?sat_a=${satA}&sat_b=${satB}&hours=${hours}&threshold=${threshold}`,
  );
}

export async function getSkyPass(satelliteId, lat, lon, duration = 1440) {
  return await apiFetch(
    `/propagation/sky-pass/${satelliteId}?lat=${lat}&lon=${lon}&duration=${duration}`,
  );
}

export async function getOrbitalDecay(satelliteId) {
  return await apiFetch(`/propagation/decay/${satelliteId}`);
}
