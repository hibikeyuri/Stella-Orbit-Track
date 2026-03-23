import { useEffect, useState } from "react";

import Heading from "@/components/Heading";
import Row from "@/components/Row";
import Spinner from "@/components/Spinner";
import { getSkyPass } from "@/services/apiPropagation";
import { getSatellites } from "@/services/apiSatellites";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";

// Default observer: Taipei
const DEFAULT_LAT = 25.033;
const DEFAULT_LON = 121.565;
const SIZE = 400;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R = (SIZE - 60) / 2;

const COLORS = [
  "#22d3ee",
  "#f97316",
  "#a78bfa",
  "#34d399",
  "#fb7185",
  "#facc15",
];

function polarToXY(azDeg, elDeg) {
  // azimuth: 0=N, 90=E, 180=S, 270=W (clockwise)
  // radius: 90° elevation = center, 0° = edge
  const r = R * (1 - elDeg / 90);
  const azRad = ((azDeg - 90) * Math.PI) / 180; // rotate so North is top
  return {
    x: CX + r * Math.cos(azRad),
    y: CY + r * Math.sin(azRad),
  };
}

function PolarGrid() {
  const circles = [0, 30, 60, 90];
  const lines = [0, 45, 90, 135, 180, 225, 270, 315];
  const cardinals = [
    { label: "N", az: 0 },
    { label: "E", az: 90 },
    { label: "S", az: 180 },
    { label: "W", az: 270 },
  ];

  return (
    <g>
      {/* Elevation circles */}
      {circles.map((el) => {
        const r = R * (1 - el / 90);
        return (
          <g key={el}>
            <circle
              cx={CX}
              cy={CY}
              r={r}
              fill="none"
              stroke="#334155"
              strokeWidth={el === 0 ? 1.5 : 0.5}
              strokeDasharray={el > 0 ? "4 4" : undefined}
            />
            {el > 0 && el < 90 && (
              <text x={CX + 4} y={CY - r + 12} fill="#64748b" fontSize="10">
                {el}°
              </text>
            )}
          </g>
        );
      })}

      {/* Azimuth lines */}
      {lines.map((az) => {
        const outer = polarToXY(az, 0);
        return (
          <line
            key={az}
            x1={CX}
            y1={CY}
            x2={outer.x}
            y2={outer.y}
            stroke="#334155"
            strokeWidth={0.5}
          />
        );
      })}

      {/* Cardinal labels */}
      {cardinals.map(({ label, az }) => {
        const p = polarToXY(az, -6); // slightly outside the circle
        return (
          <text
            key={label}
            x={p.x}
            y={p.y}
            fill="#94a3b8"
            fontSize="14"
            fontWeight="bold"
            textAnchor="middle"
            dominantBaseline="central"
          >
            {label}
          </text>
        );
      })}

      {/* Zenith marker */}
      <circle cx={CX} cy={CY} r={2} fill="#64748b" />
    </g>
  );
}

function PassArc({ track, color, name }) {
  if (!track || track.length < 2) return null;

  const points = track.map((p) => polarToXY(p.azimuth, p.elevation));
  const pathData = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  const maxEl = Math.max(...track.map((p) => p.elevation));
  const peakPoint = track.find((p) => p.elevation === maxEl);
  const peakXY = peakPoint
    ? polarToXY(peakPoint.azimuth, peakPoint.elevation)
    : null;

  const startXY = points[0];

  return (
    <g>
      {/* Pass arc */}
      <path
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        opacity={0.9}
      />

      {/* Start dot */}
      <circle cx={startXY.x} cy={startXY.y} r={4} fill={color} />

      {/* End dot */}
      <circle
        cx={points[points.length - 1].x}
        cy={points[points.length - 1].y}
        r={4}
        fill={color}
        opacity={0.5}
      />

      {/* Peak label */}
      {peakXY && (
        <text
          x={peakXY.x + 8}
          y={peakXY.y - 6}
          fill={color}
          fontSize="10"
          fontWeight="600"
        >
          {name} ({maxEl.toFixed(0)}°)
        </text>
      )}

      {/* Arrow at start */}
      {points.length > 1 && (
        <circle
          cx={startXY.x}
          cy={startXY.y}
          r={6}
          fill="none"
          stroke={color}
          strokeWidth={1}
          opacity={0.6}
        />
      )}
    </g>
  );
}

export default function SkyPlot() {
  const [sats, setSats] = useState([]);
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [lat, setLat] = useState(DEFAULT_LAT);
  const [lon, setLon] = useState(DEFAULT_LON);

  // Load satellites
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await getSatellites({ pageSize: 200, page: 1 });
        if (!cancelled) {
          setSats(
            (res.satellites || []).filter((s) => s.is_active).slice(0, 50),
          );
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch sky passes for a few satellites
  async function fetchPasses() {
    setFetching(true);
    setPasses([]);
    const results = [];
    const targets = sats.slice(0, 6);

    await Promise.allSettled(
      targets.map(async (sat) => {
        try {
          const res = await getSkyPass(sat.id, lat, lon, 1440);
          if (res?.data?.track?.length > 1) {
            results.push({
              name: sat.name || `SAT-${sat.norad_id}`,
              ...res.data,
            });
          }
        } catch {
          // No visible pass for this satellite
        }
      }),
    );

    setPasses(results);
    setFetching(false);
  }

  useEffect(() => {
    if (sats.length > 0) fetchPasses();
  }, [sats]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <Row>
        <Heading as="h1">Sky Plot</Heading>
        <Badge variant="outline">{passes.length} passes found</Badge>
      </Row>

      {/* Observer location */}
      <div className="flex flex-wrap items-end gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="space-y-1">
          <Label htmlFor="obs-lat">Observer Latitude</Label>
          <Input
            id="obs-lat"
            type="number"
            step="0.001"
            value={lat}
            onChange={(e) => setLat(Number(e.target.value))}
            className="w-36"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="obs-lon">Observer Longitude</Label>
          <Input
            id="obs-lon"
            type="number"
            step="0.001"
            value={lon}
            onChange={(e) => setLon(Number(e.target.value))}
            className="w-36"
          />
        </div>
        <Button onClick={fetchPasses} disabled={fetching}>
          {fetching ? "Scanning..." : "Scan Passes"}
        </Button>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Polar chart */}
        <div className="flex items-center justify-center rounded-xl border border-gray-200 bg-slate-950 p-6 shadow-sm">
          <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
            <PolarGrid />
            {passes.map((pass, i) => (
              <PassArc
                key={pass.satellite_id}
                track={pass.track}
                color={COLORS[i % COLORS.length]}
                name={pass.name}
              />
            ))}
          </svg>
        </div>

        {/* Pass details table */}
        <div className="flex-1 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">
            Upcoming Passes (next 24h)
          </h3>
          {passes.length === 0 && !fetching && (
            <p className="text-sm text-gray-400">
              No visible passes found from this location.
            </p>
          )}
          {fetching && <Spinner />}
          <div className="space-y-3">
            {passes.map((pass, i) => (
              <div
                key={pass.satellite_id}
                className="flex items-start gap-3 rounded-lg border px-4 py-3"
                style={{
                  borderLeftColor: COLORS[i % COLORS.length],
                  borderLeftWidth: 3,
                }}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-800">
                      {pass.name}
                    </span>
                    <Badge
                      variant={
                        pass.max_elevation > 45 ? "default" : "secondary"
                      }
                    >
                      {pass.max_elevation.toFixed(0)}° max
                    </Badge>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    Rise: {new Date(pass.rise_time).toLocaleTimeString()} → Set:{" "}
                    {new Date(pass.set_time).toLocaleTimeString()}
                  </div>
                  <div className="mt-1 text-xs text-gray-400">
                    {pass.track.length} track points
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
