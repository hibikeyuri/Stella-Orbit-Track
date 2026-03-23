import clsx from "clsx";

import Logo from "./Logo";
import MainNav from "./MainNav";

import { Uploader } from "@/data/Uploader";
import { useSidebar } from "@/hooks/useSidebar";

function Sidebar() {
  const { sidebarOpen, setSidebarOpen } = useSidebar();

  return (
    <aside
      className={clsx(
        "fixed inset-y-0 left-0 z-40 w-64 flex-col gap-6 overflow-y-auto border-r p-6 transition-transform duration-300",
        "bg-white dark:bg-gray-900",
        "border-gray-200 dark:border-gray-800",
        "md:static md:row-span-full md:flex md:translate-x-0",
        sidebarOpen ? "flex translate-x-0" : "-translate-x-full",
      )}
    >
      <Logo />
      <MainNav onNavigate={() => setSidebarOpen(false)} />
      <Uploader />
    </aside>
  );
}

export default Sidebar;
