import React, { useState, useEffect } from "react";
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

import Heading from "../components/Heading";
import Row from "../components/Row";
import { Button } from "../ui/button.tsx";

import Spinner from "@/components/Spinner";
import { satellites as realsatellites } from "@/data/data-satellites";
import SatelliteCard from "@/features/satellite/SatelliteCard";
import SatelliteView from "@/features/satellite/SatelliteView";
import {
  parseTLE,
  meanMotionToAltitude,
  generateFlyoverHistory,
  TaipeiLocation,
} from "@/utils/algo-satellites";

const COLORS = ["#0088FE", "#FF8042", "#82ca9d"];

function StaticLabel({ value, label }) {
  return (
    <>
      <div className="flex flex-col gap-2 rounded-xl border border-gray-200 p-4">
        <h1 className="text-4xl font-bold">{value}</h1>
        <p className="text-gray-500">{label}</p>
      </div>
    </>
  );
}

export default function Dashboard() {
  const [satellites, setSatellites] = useState([]);

  // Generate and parse satellite data
  useEffect(() => {
    // const mocksatellites = Array.from({ length: 500 }, (_, i) =>
    //   randomTLE(i + 1),
    // );
    // const tleRaw = [...mocksatellites, ...realsatellites];
    const tleRaw = realsatellites;

    if (tleRaw.length === 0) return;

    console.log(tleRaw);
    const parsed = tleRaw.map((s) => {
      const p = parseTLE(s);
      p.altitude = meanMotionToAltitude(p.meanMotion);
      const statusHistory = generateFlyoverHistory(
        s.line1,
        s.line2,
        TaipeiLocation.lat,
        TaipeiLocation.lon,
        TaipeiLocation.alt,
        5, // next number of flyovers
      );
      p.status = statusHistory;
      console.log(p);
      return p;
    });
    console.log(parsed);
    setSatellites(parsed);
  }, []);

  if (!satellites) return <Spinner />;

  // Inclination Distribution
  const inclinationData = [
    {
      range: "0-20°",
      count: satellites.filter((s) => s.inclination < 20).length,
    },
    {
      range: "40-60°",
      count: satellites.filter(
        (s) => s.inclination >= 40 && s.inclination <= 60,
      ).length,
    },
    {
      range: "90-100°",
      count: satellites.filter(
        (s) => s.inclination >= 90 && s.inclination <= 100,
      ).length,
    },
  ];

  // Eccentricity Distribution
  const eccentricityData = [
    {
      type: "Circular",
      value: satellites.filter((s) => s.eccentricity < 0.1).length,
    },
    {
      type: "Elliptical",
      value: satellites.filter((s) => s.eccentricity >= 0.1).length,
    },
  ];

  // Launch Year Trend
  const yearData = Object.values(
    satellites.reduce((acc, s) => {
      acc[s.year] = acc[s.year] || {
        year: s.year,
        count: 0,
        avgInclination: 0,
        avgAltitude: 0,
        sats: [],
      };
      acc[s.year].count++;
      acc[s.year].sats.push(s);
      return acc;
    }, {}),
  ).map((d) => ({
    year: d.year,
    count: d.count,
    avgInclination:
      d.sats.reduce((sum, s) => sum + s.inclination, 0) / d.sats.length,
    avgAltitude: d.sats.reduce((sum, s) => sum + s.altitude, 0) / d.sats.length,
  }));

  // On-Orbit Lifetime
  const lifetimeData = satellites.map((s) => ({ name: s.name, age: s.age }));

  // Altitude Distribution (LEO / MEO / GEO)
  const altitudeData = [
    {
      type: "LEO (<2000 km)",
      count: satellites.filter((s) => s.altitude < 2000).length,
    },
    {
      type: "MEO (2000-35786 km)",
      count: satellites.filter((s) => s.altitude >= 2000 && s.altitude < 35786)
        .length,
    },
    {
      type: "GEO (~35786 km)",
      count: satellites.filter((s) => Math.abs(s.altitude - 35786) < 200)
        .length,
    },
  ];

  return (
    <>
      {/* Row Title */}
      <Row>
        <Heading as="h1">Dashboard</Heading>
      </Row>

      {/* Satellites Statics */}
      <div className="grid auto-rows-min gap-4 space-y-8 md:grid-cols-4">
        <StaticLabel value={satellites.length} label="Total Satellites" />
        <StaticLabel value={1} label="Deprecated" />
        <StaticLabel value={2} label="Fly Over Numbers" />
        <StaticLabel value={3} label="Incoming Fly Over Numbers" />
      </div>

      {/* Satellites TLE Inference Data */}
      <div className="grid grid-cols-1 gap-8 space-y-8 md:grid-cols-2 lg:grid-cols-3">
        {/* Inclination Distribution */}
        <div>
          <h2 className="mb-2 text-lg font-bold">Inclination Distribution</h2>
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
          <h2 className="mb-2 text-lg font-bold">Eccentricity Distribution</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={eccentricityData}
                dataKey="value"
                nameKey="type"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {eccentricityData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Launch Year Trend */}
        <div>
          <h2 className="mb-2 text-lg font-bold">Launch Year Trend</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={yearData}>
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#8884d8"
                name="Launch Count"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* On-Orbit Lifetime */}
        <div>
          <h2 className="mb-2 text-lg font-bold">On-Orbit Lifetime</h2>
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
          <h2 className="mb-2 text-lg font-bold">
            Altitude Distribution (LEO / MEO / GEO)
          </h2>
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
          <h2 className="mb-2 text-lg font-bold">
            Average Inclination & Average Altitude (by Year)
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={yearData}>
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="avgInclination"
                stroke="#FF8042"
                name="Avg Inclination (°)"
              />
              <Line
                type="monotone"
                dataKey="avgAltitude"
                stroke="#0088FE"
                name="Avg Altitude (km)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Fly Over Status */}
      <div className="grid auto-rows-min gap-4 space-y-8 md:grid-cols-3">
        {satellites.map((satellite) => (
          <SatelliteCard satellite={satellite}></SatelliteCard>
        ))}
      </div>
    </>
  );
}
