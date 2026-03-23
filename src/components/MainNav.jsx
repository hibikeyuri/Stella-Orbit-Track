import clsx from "clsx";
import {
  Antenna,
  GitCompareArrows,
  Globe,
  LayoutDashboard,
  Radar,
  SatelliteDish,
  Settings,
  Users,
} from "lucide-react";
import { NavLink } from "react-router-dom";

function Span({ isActive = false, className = "", children }) {
  return (
    <span
      className={clsx(
        "h-5 w-5 transition-colors duration-300",
        "text-gray-400 group-hover:text-brand-600",
        "dark:text-gray-500 dark:group-hover:text-brand-200",
        isActive && "text-brand-600 dark:text-brand-200",
        className,
      )}
    >
      {children}
    </span>
  );
}

function MainNav({ onNavigate }) {
  const links = [
    { to: "/dashboard", icon: <LayoutDashboard />, label: "Dashboard" },
    { to: "/satellites", icon: <SatelliteDish />, label: "Satellites" },
    { to: "/tles", icon: <Antenna />, label: "TLEs" },
    { to: "/tracker", icon: <Globe />, label: "Live Tracker" },
    { to: "/sky-plot", icon: <Radar />, label: "Sky Plot" },
    { to: "/compare", icon: <GitCompareArrows />, label: "Compare" },
    { to: "/users", icon: <Users />, label: "Users" },
    { to: "/settings", icon: <Settings />, label: "Settings" },
  ];

  return (
    <nav>
      <ul className="flex flex-col gap-1">
        {links.map(({ to, icon, label }) => (
          <li key={to}>
            <NavLink
              to={to}
              onClick={onNavigate}
              className={({ isActive }) =>
                clsx(
                  "group flex items-center gap-3 rounded-md px-4 py-2.5 text-sm font-medium transition-all duration-200",
                  "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                  "dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100",
                  isActive && "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100",
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
