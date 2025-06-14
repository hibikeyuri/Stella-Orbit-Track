import { Outlet } from "react-router-dom";
import clsx from "clsx";
import Sidebar from "./Sidebar";
import Header from "./Header";

function Container({children}) {
  return (
    <div className="mx-auto max-w-[120rem] px-4 flex flex-col">{children}</div>
  );
}

function AppLayout() {
  return (
    <div
      className={clsx(
        "grid",
        "grid-cols-[19rem_1fr]",
        "grid-rows-[auto_1fr]",
        "h-screen",
      )}
    >
      <Header />
      <Sidebar />
      <main
        className={clsx(
          "bg-gray-50",
          "px-12 py-16",
          "pb-[6.4rem]",
          "overflow-x-auto",
        )}
      >
        <Container>
          <Outlet />
        </Container>
      </main>
    </div>
  );
}

export default AppLayout;
