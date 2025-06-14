import React from "react";
import Logo from "./Logo";
import MainNav from "./MainNav";
import { Uploader } from "@/data/Uploader";

function Sidebar() {
  return (
    <>
      <aside className="bg-grey-0 border-grey-100 row-span-full flex flex-col gap-8 overflow-hidden border-r p-8 px-6">
        <Logo />
        <MainNav />
        <Uploader></Uploader>
      </aside>
    </>
  );
}

export default Sidebar;
