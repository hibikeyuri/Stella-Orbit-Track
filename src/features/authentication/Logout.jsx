import { LogOut } from "lucide-react";

import { useLogout } from "./useLogout";

import SpinnerMini from "@/components/SpinnerMini";
import { Button } from "@/ui/button";

function Logout() {
  const { logout, isLoading } = useLogout();
  return (
    <Button disabled={isLoading} onClick={logout} variant="ghost">
      {!isLoading ? <LogOut /> : <SpinnerMini />}
    </Button>
  );
}

export default Logout;
