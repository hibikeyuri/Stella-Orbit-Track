import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { getCurrentUser } from "@/services/apiAuth";

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("connecting");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    localStorage.setItem("access_token", token);

    const timer = setTimeout(() => {
      setStatus("syncing");
    }, 800);

    getCurrentUser()
      .then((user) => {
        queryClient.setQueryData(["user"], user);
        setStatus("ready");
        setTimeout(() => navigate("/dashboard", { replace: true }), 1200);
      })
      .catch(() => {
        localStorage.removeItem("access_token");
        navigate("/login", { replace: true });
      });

    return () => clearTimeout(timer);
  }, [navigate, queryClient, searchParams]);

  const messages = {
    connecting: "Establishing satellite link…",
    syncing: "Synchronizing orbit data…",
    ready: "Lock acquired — redirecting…",
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-950">
      {/* Orbit animation */}
      <div className="relative h-32 w-32">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-8 w-8 rounded-full bg-brand-500 shadow-[0_0_20px_rgba(99,102,241,0.6)]" />
        </div>
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: "3s" }}>
          <div className="absolute top-0 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
        </div>
        <div
          className="absolute inset-2 rounded-full border border-brand-500/30"
          style={{ borderStyle: "dashed" }}
        />
      </div>

      <p className="animate-pulse text-sm tracking-wide text-gray-400">
        {messages[status]}
      </p>
    </div>
  );
}
