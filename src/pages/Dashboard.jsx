import React, { useState, useEffect } from "react";
import Heading from "../components/Heading";
import Row from "../components/Row";
import { Button } from "../ui/button.tsx";
import { satellites as realsatellites } from "@/data/data-satellites";
import { randomTLE } from "@/lib/utils";
import Spinner from "@/components/Spinner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  ResponsiveContainer,
  Legend,
} from "recharts";

// Utils: Parse TLE line2
function parseTLE(satellite) {
  const line2 = satellite.line2.split(/\s+/);
  return {
    id: satellite.id,
    name: satellite.name,
    inclination: parseFloat(line2[2]),
    raan: parseFloat(line2[3]),
    eccentricity: parseFloat("0." + line2[4]),
    meanMotion: parseFloat(line2[7]),
    year: new Date(satellite.date).getUTCFullYear(),
    age: Math.floor((Date.now() - new Date(satellite.date)) / (1000 * 60 * 60 * 24)),
  };
}

// Utils: Convert Mean Motion to Altitude (km)
function meanMotionToAltitude(n) {
  const GM = 398600.4418;
  const Re = 6371;
  const T = 86400 / n;
  const a = Math.cbrt((GM * T * T) / (4 * Math.PI * Math.PI));
  return a - Re;
}

const COLORS = ["#0088FE", "#FF8042", "#82ca9d"];

export default function Dashboard() {
  const [satellites, setSatellites] = useState(null);

  // Generate and parse satellite data
  useEffect(() => {
    setTimeout(() => {
      const mocksatellites = Array.from({ length: 500 }, (_, i) => randomTLE(i + 1));
      const tleRaw = [...mocksatellites, ...realsatellites];
      const parsed = tleRaw.map(s => {
        const p = parseTLE(s);
        p.altitude = meanMotionToAltitude(p.meanMotion);
        return p;
      });
      setSatellites(parsed);
    }, 300); // simulate async loading
  }, []);

  if (!satellites) return <Spinner />;

  // Inclination Distribution
  const inclinationData = [
    { range: "0-20°", count: satellites.filter(s => s.inclination < 20).length },
    { range: "40-60°", count: satellites.filter(s => s.inclination >= 40 && s.inclination <= 60).length },
    { range: "90-100°", count: satellites.filter(s => s.inclination >= 90 && s.inclination <= 100).length },
  ];

  // Eccentricity Distribution
  const eccentricityData = [
    { type: "Circular", value: satellites.filter(s => s.eccentricity < 0.1).length },
    { type: "Elliptical", value: satellites.filter(s => s.eccentricity >= 0.1).length },
  ];

  // Launch Year Trend
  const yearData = Object.values(
    satellites.reduce((acc, s) => {
      acc[s.year] = acc[s.year] || { year: s.year, count: 0, avgInclination: 0, avgAltitude: 0, sats: [] };
      acc[s.year].count++;
      acc[s.year].sats.push(s);
      return acc;
    }, {})
  ).map(d => ({
    year: d.year,
    count: d.count,
    avgInclination: d.sats.reduce((sum, s) => sum + s.inclination, 0) / d.sats.length,
    avgAltitude: d.sats.reduce((sum, s) => sum + s.altitude, 0) / d.sats.length,
  }));

  // On-Orbit Lifetime
  const lifetimeData = satellites.map(s => ({ name: s.name, age: s.age }));

  // Altitude Distribution (LEO / MEO / GEO)
  const altitudeData = [
    { type: "LEO (<2000 km)", count: satellites.filter(s => s.altitude < 2000).length },
    { type: "MEO (2000-35786 km)", count: satellites.filter(s => s.altitude >= 2000 && s.altitude < 35786).length },
    { type: "GEO (~35786 km)", count: satellites.filter(s => Math.abs(s.altitude - 35786) < 200).length },
  ];

  return (
    <div className="space-y-8 p-8">
      <Row className="justify-between">
        <Heading as="h1">Dashboard</Heading>
        <Button variant="default">Arknights</Button>
      </Row>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Inclination Distribution */}
        <div>
          <h2 className="text-lg font-bold mb-2">Inclination Distribution</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={inclinationData}>
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Eccentricity Distribution */}
        <div>
          <h2 className="text-lg font-bold mb-2">Eccentricity Distribution</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={eccentricityData} dataKey="value" nameKey="type" cx="50%" cy="50%" outerRadius={80} label>
                {eccentricityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Launch Year Trend */}
        <div>
          <h2 className="text-lg font-bold mb-2">Launch Year Trend</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={yearData}>
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#8884d8" name="Launch Count" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* On-Orbit Lifetime */}
        <div>
          <h2 className="text-lg font-bold mb-2">On-Orbit Lifetime</h2>
          <ResponsiveContainer width="100%" height={250}>
            <ScatterChart>
              <XAxis dataKey="name" />
              <YAxis dataKey="age" />
              <Tooltip />
              <Scatter data={lifetimeData} fill="#82ca9d" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Altitude Distribution */}
        <div>
          <h2 className="text-lg font-bold mb-2">Altitude Distribution (LEO / MEO / GEO)</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={altitudeData}>
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#0088FE" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Average Inclination & Altitude */}
        <div>
          <h2 className="text-lg font-bold mb-2">Average Inclination & Average Altitude (by Year)</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={yearData}>
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="avgInclination" stroke="#FF8042" name="Avg Inclination (°)" />
              <Line type="monotone" dataKey="avgAltitude" stroke="#0088FE" name="Avg Altitude (km)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}