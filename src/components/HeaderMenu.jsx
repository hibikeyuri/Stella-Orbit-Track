import { User } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Logout from "@/features/authentication/Logout";
import { Button } from "@/ui/button";

export default function HeaderMenu() {
  const navigate = useNavigate();

  return (
    <ul className="flex gap-1">
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
