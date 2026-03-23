import clsx from "clsx";
import { useState } from "react";
import { Outlet } from "react-router-dom";

import Header from "./Header";
import Sidebar from "./Sidebar";

import { SidebarContext } from "@/hooks/useSidebar";

function Container({ children }) {
  return (
    <div className="mx-auto flex max-w-[120rem] flex-col px-4">{children}</div>
  );
}

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <SidebarContext.Provider
      value={{ sidebarOpen, setSidebarOpen, toggleSidebar: () => setSidebarOpen((v) => !v) }}
    >
      <div
        className={clsx(
          "grid h-screen",
          "grid-rows-[auto_1fr]",
          "md:grid-cols-[16rem_1fr]",
        )}
      >
        <Header />
        <Sidebar />

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main
          className={clsx(
            "overflow-x-auto px-4 py-6 pb-[6.4rem]",
            "sm:px-8 sm:py-10",
            "md:px-12 md:py-16",
            "bg-gray-50 dark:bg-gray-950",
            "transition-colors duration-300",
          )}
        >
          <Container>
            <Outlet />
          </Container>
        </main>
      </div>
    </SidebarContext.Provider>
  );
}

export default AppLayout;
