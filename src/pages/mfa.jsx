import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { verifyMfa, setAuthToken } from "@/services/apiAuth";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";

export default function MFA() {
  const [searchParams] = useSearchParams();
  const tempToken = searchParams.get("temp_token");
  const [code, setCode] = useState("");
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutate: verify, isLoading } = useMutation({
    mutationFn: ({ tempToken, code }) => verifyMfa({ tempToken, code }),
    onSuccess: (data) => {
      setAuthToken(data["access_token"]);
      queryClient.invalidateQueries(["user"]);
      navigate("/dashboard", { replace: true });
    },
    onError: () => {
      alert("Invalid MFA code");
    },
  });

  function handleSubmit(e) {
    e.preventDefault();
    verify({ tempToken, code });
  }

  if (!tempToken)
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950">
        <p className="text-lg text-red-400">Missing MFA token</p>
      </div>
    );

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-900 p-8 shadow-lg">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-500/10">
          <ShieldCheck className="h-7 w-7 text-brand-400" />
        </div>
        <h1 className="mb-2 text-center text-2xl font-semibold text-gray-100">
          MFA Verification
        </h1>
        <p className="mb-6 text-center text-gray-400">
          Enter the 6-digit code from your authenticator app.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            type="text"
            placeholder="Enter 6-digit code"
            value={code}
            maxLength={6}
            required
            onChange={(e) => setCode(e.target.value)}
            className="text-center text-lg tracking-[0.3em]"
          />

          <Button type="submit" disabled={isLoading} className="mt-2 w-full">
            {isLoading ? "Verifying…" : "Verify & Login"}
          </Button>
        </form>
      </div>
    </div>
  );
}
