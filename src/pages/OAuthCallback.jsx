import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { getCurrentUser } from "@/services/apiAuth";

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    localStorage.setItem("access_token", token);

    getCurrentUser()
      .then((user) => {
        queryClient.setQueryData(["user"], user);

        navigate("/dashboard", { replace: true });
      })
      .catch(() => {
        localStorage.removeItem("access_token");
        navigate("/login", { replace: true });
      });
  }, [navigate, queryClient, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-gray-500">Signing you in…</p>
    </div>
  );
}
