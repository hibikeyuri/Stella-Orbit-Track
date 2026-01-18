import { useMutation, useQueryClient } from "@tanstack/react-query";
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
    onError: (err) => {
      console.log("Invalid MFA code", err);
      alert("Invalid MFA code");
    },
  });

  function handleSubmit(e) {
    e.preventDefault();
    verify({ tempToken, code });
  }

  if (!tempToken)
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg text-red-500">Missing MFA token</p>
      </div>
    );

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="mb-2 text-center text-2xl font-semibold">
          MFA Verification
        </h1>
        <p className="mb-6 text-center text-gray-600">
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
            className="text-lg"
          />

          <Button type="submit" disabled={isLoading} className="mt-2 w-full">
            {isLoading ? "Verifying..." : "Verify & Login"}
          </Button>
        </form>
      </div>
    </div>
  );
}
