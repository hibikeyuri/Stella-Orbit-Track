export default function DashboardStats({ satellites }) {
  const total = satellites.length;
  const active = satellites.filter((s) => s.is_active).length;
  const inactive = total - active;

  const leoCount = satellites.filter(
    (s) => s.altitude != null && s.altitude < 2000,
  ).length;

  const stats = [
    { value: total, label: "Total Satellites" },
    { value: active, label: "Active" },
    { value: inactive, label: "Inactive" },
    { value: leoCount, label: "LEO Satellites" },
  ];

  return (
    <div className="grid auto-rows-min gap-4 md:grid-cols-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="flex flex-col gap-2 rounded-xl border border-gray-200 p-4"
        >
          <h1 className="text-4xl font-bold">{s.value}</h1>
          <p className="text-gray-500">{s.label}</p>
        </div>
      ))}
    </div>
  );
}
