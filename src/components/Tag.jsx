import clsx from "clsx";

export default function Tag({ type = "blue", children }) {
  const baseClasses =
    "inline-block text-[1.1rem] font-semibold uppercase rounded-full px-4 py-1";

  const colorMap = {
    blue: "text-blue-700 bg-blue-100",
    green: "text-green-700 bg-green-100",
    red: "text-red-700 bg-red-100",
    yellow: "text-yellow-700 bg-yellow-100",
    purple: "text-purple-700 bg-purple-100",
    gray: "text-gray-700 bg-gray-100",
  };

  const colorClasses = colorMap[type] || colorMap.gray;

  return <span className={clsx(baseClasses, colorClasses)}>{children}</span>;
}
