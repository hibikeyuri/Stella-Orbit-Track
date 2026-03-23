import { Menu } from "lucide-react";

import UserAvatar from "../features/authentication/UserAvatar";

import HeaderMenu from "./HeaderMenu";

import { useSidebar } from "@/hooks/useSidebar";
import { Button } from "@/ui/button";

function Header() {
  const { toggleSidebar } = useSidebar();

  return (
    <header className="flex items-center justify-between gap-4 border-b border-gray-200 bg-white px-4 py-3 transition-colors duration-300 dark:border-gray-800 dark:bg-gray-900 sm:px-8 md:col-span-1 md:justify-end md:px-12">
      {/* Hamburger — mobile only */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={toggleSidebar}
      >
        <Menu className="h-6 w-6" />
      </Button>

      <div className="flex items-center gap-4">
        <UserAvatar />
        <HeaderMenu />
      </div>
    </header>
  );
}

export default Header;
