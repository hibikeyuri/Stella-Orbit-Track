import { Outlet } from "react-router-dom";
import clsx from "clsx";
import Sidebar from "./Sidebar";
import Header from "./Header";

function AppLayout() {
  return (
    <div
      className={clsx(
        "grid",
        "grid-cols-[26rem_1fr]",
        "grid-rows-[auto_1fr]",
        "h-screen",
      )}
    >
      <Header />
      <Sidebar />
      <main
        className={clsx(
          "bg-gray-50",
          "px-12 py-16", // padding: 4rem 4.8rem 6.4rem
          "pb-[6.4rem]" // bottom padding手動補上
        )}
      >
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;