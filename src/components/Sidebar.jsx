import React from "react";
import Logo from "./Logo";
import MainNav from "./MainNav";

function Sidebar() {
  return (
    <>
      <aside className="bg-grey-0 border-grey-100 row-span-full flex flex-col gap-8 border-r p-8 px-6">
        <Logo />
        <MainNav />
      </aside>
    </>
  );
}

export default Sidebar;
