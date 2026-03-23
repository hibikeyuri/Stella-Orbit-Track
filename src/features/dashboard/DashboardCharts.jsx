import { useMemo } from "react";
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

const COLORS = ["#0088FE", "#FF8042", "#82ca9d"];

export default function DashboardCharts({ satellites }) {
  const {
    inclinationData,
    eccentricityData,
    yearData,
    lifetimeData,
    altitudeData,
  } = useMemo(() => {
    const inclinationData = [
      {
        range: "0-20°",
        count: satellites.filter((s) => s.inclination < 20).length,
      },
      {
        range: "20-40°",
        count: satellites.filter(
          (s) => s.inclination >= 20 && s.inclination < 40,
        ).length,
      },
      {
        range: "40-60°",
        count: satellites.filter(
          (s) => s.inclination >= 40 && s.inclination < 60,
        ).length,
      },
      {
        range: "60-80°",
        count: satellites.filter(
          (s) => s.inclination >= 60 && s.inclination < 80,
        ).length,
      },
      {
        range: "80-100°",
        count: satellites.filter(
          (s) => s.inclination >= 80 && s.inclination <= 100,
        ).length,
      },
    ];

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

    const yearData = Object.values(
      satellites.reduce((acc, s) => {
        const year = s.date ? new Date(s.date).getUTCFullYear() : "Unknown";
        if (year === "Unknown") return acc;
        acc[year] = acc[year] || { year, count: 0, sats: [] };
        acc[year].count++;
        acc[year].sats.push(s);
        return acc;
      }, {}),
    )
      .map((d) => ({
        year: d.year,
        count: d.count,
        avgInclination:
          d.sats.reduce((sum, s) => sum + (s.inclination || 0), 0) /
          d.sats.length,
        avgAltitude:
          d.sats.reduce((sum, s) => sum + (s.altitude || 0), 0) / d.sats.length,
      }))
      .sort((a, b) => a.year - b.year);

    const lifetimeData = satellites.map((s) => ({
      name: s.name,
      age: s.age_days ?? 0,
    }));

    const altitudeData = [
      {
        type: "LEO (<2000 km)",
        count: satellites.filter((s) => s.altitude != null && s.altitude < 2000)
          .length,
      },
      {
        type: "MEO (2000-35786 km)",
        count: satellites.filter(
          (s) => s.altitude != null && s.altitude >= 2000 && s.altitude < 35786,
        ).length,
      },
      {
        type: "GEO (~35786 km)",
        count: satellites.filter(
          (s) => s.altitude != null && Math.abs(s.altitude - 35786) < 200,
        ).length,
      },
    ];

    return {
      inclinationData,
      eccentricityData,
      yearData,
      lifetimeData,
      altitudeData,
    };
  }, [satellites]);

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
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

      {/* Average Inclination & Altitude by Year */}
      <div>
        <h2 className="mb-2 text-lg font-bold">
          Average Inclination & Altitude (by Year)
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
  );
}
