import clsx from "clsx";
import {
  LayoutDashboard,
  SatelliteDish,
  Users,
  Settings,
  Antenna,
} from "lucide-react";
import { NavLink } from "react-router-dom";

// 自訂 Span component，處理 isActive 狀態與 className 合併
function Span({ isActive = false, className = "", children }) {
  const mergedClassName = clsx(
    "h-6 w-6 text-gray-400 transition-colors duration-300",
    "group-hover:text-brand-600",
    isActive && "text-brand-600",
    className,
  );
  return <span className={mergedClassName}>{children}</span>;
}

function MainNav() {
  const links = [
    { to: "/dashboard", icon: <LayoutDashboard />, label: "Dashboard" },
    { to: "/satellites", icon: <SatelliteDish />, label: "Satellites" },
    { to: "/tles", icon: <Antenna />, label: "Tles" },
    { to: "/users", icon: <Users />, label: "Users" },
    { to: "/settings", icon: <Settings />, label: "Settings" },
  ];

  return (
    <nav>
      <ul className="flex flex-col gap-2">
        {links.map(({ to, icon, label }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                clsx(
                  "group flex items-center gap-3 rounded-sm px-6 py-3 text-[1.6rem] font-medium transition-all duration-300",
                  "text-gray-600 hover:bg-gray-50 hover:text-gray-800",
                  isActive && "bg-gray-50 text-gray-800",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Span isActive={isActive}>{icon}</Span>
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default MainNav;
