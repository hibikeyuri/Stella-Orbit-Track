import { useEffect } from "react";
import { useNavigate } from "react-router";

import Spinner from "./Spinner";

import { useUser } from "@/features/authentication/useUser";

function ProtectedRoute({ children }) {
  const navigate = useNavigate();

  // 1.Load Auth User
  const { isLoading, isAuthenticated } = useUser();

  // 3. if no Auth User, redirecting to /login page
  useEffect(
    function () {
      if (!isAuthenticated && !isLoading) navigate("/login");
    },
    [isAuthenticated, isLoading, navigate],
  );

  // 2. While loading, show a spinner
  if (isLoading)
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Spinner />
      </div>
    );

  // 4. otherwise render app
  if (isAuthenticated) return children;
}

export default ProtectedRoute;
