import { Moon, Sun } from "lucide-react";

import { useDarkMode } from "@/hooks/useDarkMode";
import { Button } from "@/ui/button";

export default function DarkModeToggle() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
      {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
}
