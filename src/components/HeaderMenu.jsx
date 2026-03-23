import { User } from "lucide-react";
import { useNavigate } from "react-router-dom";

import DarkModeToggle from "./DarkModeToggle";

import Logout from "@/features/authentication/Logout";
import { Button } from "@/ui/button";

export default function HeaderMenu() {
  const navigate = useNavigate();

  return (
    <ul className="flex items-center gap-1">
      <li>
        <DarkModeToggle />
      </li>
      <li>
        <Button variant="ghost" onClick={() => navigate("/account")}>
          <User />
        </Button>
      </li>
      <li>
        <Logout />
      </li>
    </ul>
  );
}
