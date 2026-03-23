import { useEffect, useState } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid as RPolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
} from "recharts";

import Heading from "@/components/Heading";
import Row from "@/components/Row";
import Spinner from "@/components/Spinner";
import { getConjunction, getOrbitalDecay } from "@/services/apiPropagation";
import { getSatellites } from "@/services/apiSatellites";
import { getTle } from "@/services/apiTles";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Label } from "@/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";

// Normalize values to 0-100 scale for radar chart
function normalize(val, min, max) {
  if (max === min) return 50;
  return Math.round(((val - min) / (max - min)) * 100);
}

function CompareRadar({ satA, satB }) {
  if (!satA || !satB) return null;

  const fields = [
    { key: "inclination", label: "Inclination" },
    { key: "eccentricity", label: "Eccentricity" },
    { key: "mean_motion", label: "Mean Motion" },
    { key: "semi_major_axis", label: "Semi-major Axis" },
    { key: "raan", label: "RAAN" },
    { key: "period", label: "Period" },
  ];

  // Compute normalization ranges
  const ranges = {};
  fields.forEach(({ key }) => {
    const a = satA[key] || 0;
    const b = satB[key] || 0;
    ranges[key] = { min: Math.min(a, b) * 0.8, max: Math.max(a, b) * 1.2 };
  });

  const data = fields.map(({ key, label }) => ({
    param: label,
    A: normalize(satA[key] || 0, ranges[key].min, ranges[key].max),
    B: normalize(satB[key] || 0, ranges[key].min, ranges[key].max),
  }));

  return (
    <ResponsiveContainer width="100%" height={360}>
      <RadarChart data={data}>
        <RPolarGrid stroke="#334155" />
        <PolarAngleAxis
          dataKey="param"
          tick={{ fill: "#94a3b8", fontSize: 11 }}
        />
        <PolarRadiusAxis tick={false} domain={[0, 100]} />
        <Radar
          name={satA.name || "Sat A"}
          dataKey="A"
          stroke="#22d3ee"
          fill="#22d3ee"
          fillOpacity={0.2}
        />
        <Radar
          name={satB.name || "Sat B"}
          dataKey="B"
          stroke="#f97316"
          fill="#f97316"
          fillOpacity={0.2}
        />
        <Legend />
      </RadarChart>
    </ResponsiveContainer>
  );
}

function ParamRow({ label, valA, valB, unit = "" }) {
  const diff = valA && valB ? Math.abs(valA - valB) : null;
  return (
    <div className="grid grid-cols-4 gap-2 border-b border-gray-100 py-2 text-sm">
      <div className="font-medium text-gray-600">{label}</div>
      <div className="font-mono text-gray-800">
        {valA?.toFixed?.(4) ?? "-"} {unit}
      </div>
      <div className="font-mono text-gray-800">
        {valB?.toFixed?.(4) ?? "-"} {unit}
      </div>
      <div className="font-mono text-gray-500">
        {diff != null ? `Δ ${diff.toFixed(4)}` : "-"}
      </div>
    </div>
  );
}

function DecayCard({ decay }) {
  if (!decay) return null;

  const riskColors = {
    stable: "bg-green-100 text-green-700",
    low: "bg-blue-100 text-blue-700",
    medium: "bg-yellow-100 text-yellow-700",
    high: "bg-red-100 text-red-700",
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-gray-800">{decay.name}</h4>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${riskColors[decay.risk_level] || riskColors.stable}`}
        >
          {decay.risk_level.toUpperCase()}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-gray-500">Altitude</p>
          <p className="font-mono">{decay.altitude_km.toFixed(1)} km</p>
        </div>
        <div>
          <p className="text-gray-500">Mean Motion</p>
          <p className="font-mono">{decay.mean_motion.toFixed(6)} rev/day</p>
        </div>
        <div>
          <p className="text-gray-500">BSTAR Drag</p>
          <p className="font-mono">{decay.bstar.toExponential(4)}</p>
        </div>
        <div>
          <p className="text-gray-500">Est. Time to Decay</p>
          <p className="font-mono font-semibold">
            {decay.estimated_days_to_decay != null
              ? decay.estimated_days_to_decay > 365
                ? `${(decay.estimated_days_to_decay / 365).toFixed(1)} years`
                : `${decay.estimated_days_to_decay.toFixed(0)} days`
              : "Stable / N/A"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function OrbitCompare() {
  const [sats, setSats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [satIdA, setSatIdA] = useState(null);
  const [satIdB, setSatIdB] = useState(null);
  const [conjunction, setConjunction] = useState(null);
  const [conjLoading, setConjLoading] = useState(false);
  const [decayA, setDecayA] = useState(null);
  const [decayB, setDecayB] = useState(null);
  const [tleA, setTleA] = useState(null);
  const [tleB, setTleB] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await getSatellites({ pageSize: 200, page: 1 });
        if (!cancelled) {
          const active = (res.satellites || []).filter((s) => s.is_active);
          setSats(active);
          if (active.length >= 2) {
            setSatIdA(active[0].id);
            setSatIdB(active[1].id);
          }
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

  // Fetch TLE + decay data when selection changes
  useEffect(() => {
    if (!satIdA) return;
    getTle(satIdA)
      .then((tle) => setTleA(tle))
      .catch(() => setTleA(null));
    getOrbitalDecay(satIdA)
      .then((res) => setDecayA(res.data))
      .catch(() => setDecayA(null));
  }, [satIdA]);

  useEffect(() => {
    if (!satIdB) return;
    getTle(satIdB)
      .then((tle) => setTleB(tle))
      .catch(() => setTleB(null));
    getOrbitalDecay(satIdB)
      .then((res) => setDecayB(res.data))
      .catch(() => setDecayB(null));
  }, [satIdB]);

  async function runConjunction() {
    if (!satIdA || !satIdB) return;
    setConjLoading(true);
    try {
      const res = await getConjunction(satIdA, satIdB, 24, 100);
      setConjunction(res.data);
    } catch (e) {
      console.error(e);
      setConjunction(null);
    } finally {
      setConjLoading(false);
    }
  }

  const satA = sats.find((s) => s.id === satIdA);
  const satB = sats.find((s) => s.id === satIdB);

  // Merge satellite name with TLE orbital data for comparison
  const dataA = tleA ? { ...tleA, name: satA?.name || tleA.name } : null;
  const dataB = tleB ? { ...tleB, name: satB?.name || tleB.name } : null;

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <Row>
        <Heading as="h1">Orbit Compare</Heading>
      </Row>

      {/* Satellite selectors */}
      <div className="flex flex-wrap items-end gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="space-y-1">
          <Label>Satellite A</Label>
          <Select
            value={satIdA != null ? String(satIdA) : undefined}
            onValueChange={(v) => setSatIdA(Number(v))}
          >
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {sats.map((s) => (
                <SelectItem key={s.id} value={String(s.id)}>
                  {s.name || `SAT-${s.norad_id}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label>Satellite B</Label>
          <Select
            value={satIdB != null ? String(satIdB) : undefined}
            onValueChange={(v) => setSatIdB(Number(v))}
          >
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {sats.map((s) => (
                <SelectItem key={s.id} value={String(s.id)}>
                  {s.name || `SAT-${s.norad_id}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={runConjunction}
          disabled={!satIdA || !satIdB || conjLoading}
        >
          {conjLoading ? "Analyzing..." : "Conjunction Analysis"}
        </Button>
      </div>

      <Tabs defaultValue="compare" className="w-full">
        <TabsList>
          <TabsTrigger value="compare">Parameter Compare</TabsTrigger>
          <TabsTrigger value="conjunction">Conjunction</TabsTrigger>
          <TabsTrigger value="decay">Orbital Decay</TabsTrigger>
        </TabsList>

        {/* Compare tab */}
        <TabsContent value="compare" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Radar chart */}
            <div className="rounded-xl border border-gray-200 bg-slate-950 p-4 shadow-sm">
              <CompareRadar satA={dataA} satB={dataB} />
            </div>

            {/* Parameter table */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="mb-3 grid grid-cols-4 gap-2 text-xs font-bold text-gray-400 uppercase">
                <div>Parameter</div>
                <div>{dataA?.name || "A"}</div>
                <div>{dataB?.name || "B"}</div>
                <div>Delta</div>
              </div>
              <ParamRow
                label="Inclination"
                valA={dataA?.inclination}
                valB={dataB?.inclination}
                unit="°"
              />
              <ParamRow
                label="Eccentricity"
                valA={dataA?.eccentricity}
                valB={dataB?.eccentricity}
              />
              <ParamRow
                label="RAAN"
                valA={dataA?.raan}
                valB={dataB?.raan}
                unit="°"
              />
              <ParamRow
                label="Semi-major Axis"
                valA={dataA?.semi_major_axis}
                valB={dataB?.semi_major_axis}
                unit="km"
              />
              <ParamRow
                label="Mean Motion"
                valA={dataA?.mean_motion}
                valB={dataB?.mean_motion}
                unit="rev/d"
              />
              <ParamRow
                label="Period"
                valA={dataA?.period}
                valB={dataB?.period}
                unit="s"
              />
              <ParamRow
                label="Arg of Perigee"
                valA={dataA?.argument_of_perigee}
                valB={dataB?.argument_of_perigee}
                unit="°"
              />
              <ParamRow
                label="Mean Anomaly"
                valA={dataA?.mean_anomaly}
                valB={dataB?.mean_anomaly}
                unit="°"
              />
              <ParamRow
                label="Age"
                valA={dataA?.age_days}
                valB={dataB?.age_days}
                unit="days"
              />
            </div>
          </div>
        </TabsContent>

        {/* Conjunction tab */}
        <TabsContent value="conjunction" className="space-y-4">
          {!conjunction && !conjLoading && (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-400 shadow-sm">
              Select two satellites and click "Conjunction Analysis" to detect
              close approaches.
            </div>
          )}
          {conjLoading && <Spinner />}
          {conjunction && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <h3 className="mb-3 text-lg font-semibold text-gray-800">
                  Closest Approach
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                  <div>
                    <p className="text-gray-500">Distance</p>
                    <p className="text-2xl font-bold text-cyan-600">
                      {conjunction.closest_approach_km.toFixed(1)} km
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Time</p>
                    <p className="font-mono text-gray-800">
                      {new Date(
                        conjunction.closest_approach_time,
                      ).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Look-ahead</p>
                    <p className="font-mono text-gray-800">
                      {conjunction.duration_hours}h
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Threshold Events</p>
                    <p className="font-mono text-gray-800">
                      {conjunction.events.length}
                    </p>
                  </div>
                </div>
              </div>

              {/* Events */}
              {conjunction.events.length > 0 && (
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <h4 className="mb-3 font-semibold text-gray-700">
                    Events within {conjunction.threshold_km} km
                  </h4>
                  <div className="max-h-64 space-y-2 overflow-y-auto">
                    {conjunction.events.map((ev, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-4 rounded-lg bg-red-50 px-4 py-2 text-sm"
                      >
                        <Badge variant="destructive">
                          {ev.distance_km.toFixed(1)} km
                        </Badge>
                        <span className="font-mono text-gray-600">
                          {new Date(ev.time).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* Decay tab */}
        <TabsContent value="decay" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <DecayCard decay={decayA} />
            <DecayCard decay={decayB} />
          </div>

          {decayA && decayB && (
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h4 className="mb-2 font-semibold text-gray-700">
                Decay Comparison
              </h4>
              <div className="space-y-3">
                {[decayA, decayB].map((d) => {
                  const maxDays = Math.max(
                    decayA.estimated_days_to_decay || 0,
                    decayB.estimated_days_to_decay || 0,
                    1,
                  );
                  const pct = d.estimated_days_to_decay
                    ? Math.min((d.estimated_days_to_decay / maxDays) * 100, 100)
                    : 100;
                  const barColor =
                    d.risk_level === "high"
                      ? "bg-red-500"
                      : d.risk_level === "medium"
                        ? "bg-yellow-500"
                        : "bg-green-500";

                  return (
                    <div key={d.satellite_id}>
                      <div className="mb-1 flex justify-between text-sm">
                        <span className="font-medium text-gray-700">
                          {d.name}
                        </span>
                        <span className="text-gray-500">
                          {d.estimated_days_to_decay != null
                            ? `${d.estimated_days_to_decay.toFixed(0)} days`
                            : "Stable"}
                        </span>
                      </div>
                      <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
                        <div
                          className={`h-full rounded-full ${barColor} transition-all`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
