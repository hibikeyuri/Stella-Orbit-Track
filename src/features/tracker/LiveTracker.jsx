import L from "leaflet";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  Polyline,
  useMap,
} from "react-leaflet";

import Heading from "@/components/Heading";
import Row from "@/components/Row";
import Spinner from "@/components/Spinner";
import {
  getGroundTrack,
  getMultiPositions,
} from "@/services/apiPropagation";
import { getSatellites } from "@/services/apiSatellites";
import { Badge } from "@/ui/badge";

const COLORS = [
  "#22d3ee", // cyan
  "#f97316", // orange
  "#a78bfa", // violet
  "#34d399", // emerald
  "#fb7185", // rose
  "#facc15", // yellow
  "#60a5fa", // blue
  "#e879f9", // fuchsia
  "#4ade80", // green
  "#f472b6", // pink
];

function makeIcon(color) {
  return L.divIcon({
    className: "",
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 0 6px ${color}"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

function FitBounds({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions.map((p) => [p.lat, p.lon]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 5 });
    }
  }, [positions, map]);
  return null;
}

export default function LiveTracker() {
  const [allSats, setAllSats] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [positions, setPositions] = useState([]);
  const [tracks, setTracks] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load satellite list once
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await getSatellites({ pageSize: 200, page: 1 });
        if (!cancelled) {
          setAllSats(res.satellites || []);
          // Auto-select first 5 active
          const active = (res.satellites || [])
            .filter((s) => s.is_active)
            .slice(0, 5);
          setSelectedIds(new Set(active.map((s) => s.id)));
        }
      } catch (e) {
        console.error("Failed to load satellites", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  // Color mapping for selected satellites
  const colorMap = useMemo(() => {
    const map = {};
    const ids = [...selectedIds];
    ids.forEach((id, i) => {
      map[id] = COLORS[i % COLORS.length];
    });
    return map;
  }, [selectedIds]);

  // Fetch positions for selected satellites
  const fetchPositions = useCallback(async () => {
    const ids = [...selectedIds];
    if (ids.length === 0) {
      setPositions([]);
      return;
    }
    try {
      setRefreshing(true);
      const res = await getMultiPositions(ids);
      setPositions(res.data || []);
    } catch (e) {
      console.error("Failed to fetch positions", e);
    } finally {
      setRefreshing(false);
    }
  }, [selectedIds]);

  // Fetch ground tracks for newly selected satellites
  useEffect(() => {
    const ids = [...selectedIds];
    ids.forEach(async (id) => {
      if (tracks[id]) return;
      try {
        const res = await getGroundTrack(id, 90, 30);
        if (res?.data?.points) {
          setTracks((prev) => ({
            ...prev,
            [id]: res.data.points.map((p) => [p.lat, p.lon]),
          }));
        }
      } catch {
        // Ground track unavailable for this satellite
      }
    });
  }, [selectedIds]); // eslint-disable-line react-hooks/exhaustive-deps

  // Poll positions every 5 seconds
  useEffect(() => {
    if (selectedIds.size === 0) return;
    fetchPositions();
    const interval = setInterval(fetchPositions, 5000);
    return () => clearInterval(interval);
  }, [fetchPositions, selectedIds]);

  function toggleSat(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < 10) {
        next.add(id);
      }
      return next;
    });
  }

  if (loading) return <Spinner />;

  return (
    <div className="flex h-full flex-col gap-4">
      <Row>
        <Heading as="h1">Live Tracker</Heading>
        <div className="flex items-center gap-3">
          {refreshing && (
            <span className="animate-pulse text-xs text-cyan-500">
              Updating...
            </span>
          )}
          <Badge variant="outline">
            {selectedIds.size} / 10 satellites
          </Badge>
        </div>
      </Row>

      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Sidebar: satellite picker */}
        <div className="w-64 shrink-0 rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b px-4 py-3">
            <h3 className="text-sm font-semibold text-gray-700">
              Select Satellites
            </h3>
            <p className="text-xs text-gray-400">Max 10 simultaneous</p>
          </div>
          <div className="h-[calc(100vh-280px)] overflow-y-auto">
            <div className="space-y-1 p-2">
              {allSats.map((sat) => {
                const checked = selectedIds.has(sat.id);
                return (
                  <label
                    key={sat.id}
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleSat(sat.id)}
                      className="h-4 w-4 rounded border-gray-300 accent-cyan-500"
                    />
                    <div className="flex-1 truncate text-sm text-gray-700">
                      {sat.name || `SAT-${sat.norad_id}`}
                    </div>
                    {checked && (
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ background: colorMap[sat.id] }}
                      />
                    )}
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 overflow-hidden rounded-xl border border-gray-200 shadow-sm">
          <MapContainer
            center={[20, 0]}
            zoom={2}
            scrollWheelZoom={true}
            className="h-full w-full"
            style={{ minHeight: "500px" }}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
              subdomains="abcd"
              maxZoom={20}
            />

            {positions.length > 0 && <FitBounds positions={positions} />}

            {/* Ground tracks */}
            {[...selectedIds].map((id) =>
              tracks[id] ? (
                <Polyline
                  key={`track-${id}`}
                  positions={tracks[id]}
                  color={colorMap[id]}
                  weight={1.5}
                  opacity={0.5}
                />
              ) : null,
            )}

            {/* Satellite markers */}
            {positions.map((p) => (
              <Marker
                key={p.satellite_id}
                position={[p.lat, p.lon]}
                icon={makeIcon(colorMap[p.satellite_id] || "#fff")}
              >
                <Popup>
                  <div className="text-sm">
                    <strong>{p.name}</strong>
                    <br />
                    NORAD: {p.norad_id}
                    <br />
                    Lat: {p.lat.toFixed(4)}° Lon: {p.lon.toFixed(4)}°
                    <br />
                    Alt: {p.alt.toFixed(1)} km
                    <br />
                    Speed: {p.velocity_km_s.toFixed(2)} km/s
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      {/* Info cards */}
      {positions.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {positions.map((p) => (
            <div
              key={p.satellite_id}
              className="rounded-xl border px-4 py-3"
              style={{ borderColor: colorMap[p.satellite_id] + "60" }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: colorMap[p.satellite_id] }}
                />
                <span className="truncate text-sm font-medium text-gray-700">
                  {p.name}
                </span>
              </div>
              <div className="mt-1 space-y-0.5 font-mono text-xs text-gray-500">
                <div>{p.alt.toFixed(1)} km alt</div>
                <div>{p.velocity_km_s.toFixed(2)} km/s</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
