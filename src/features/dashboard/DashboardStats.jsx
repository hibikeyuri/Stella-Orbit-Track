export default function DashboardStats({ stats }) {
  const items = [
    { value: stats.total, label: "Total Satellites" },
    { value: stats.active, label: "Active" },
    { value: stats.inactive, label: "Inactive" },
    { value: stats.leo, label: "LEO Satellites" },
  ];

  return (
    <div className="grid auto-rows-min gap-4 md:grid-cols-4">
      {items.map((s) => (
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
