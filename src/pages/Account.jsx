import { useState } from "react";

import UpdatePasswordForm from "../features/authentication/UpdatePasswordForm";
import UpdateUserDataForm from "../features/authentication/UpdateUserDataForm";

import Heading from "@/components/Heading";
import Row from "@/components/Row";
import { useUser } from "@/features/authentication/useUser";
import { getEnableMfaPage } from "@/services/apiAuth";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";

function Account() {
  const { user } = useUser();
  const [mfaData, setMfaData] = useState(null);
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [mfaStatus, setMfaStatus] = useState(null);

  async function handleEnableMfa() {
    try {
      const data = await getEnableMfaPage();
      setMfaData(data);
      setMfaStatus(null);
    } catch (err) {
      console.error("Failed to enable MFA:", err);
    }
  }

  async function handleVerifyMfa(e) {
    e.preventDefault();
    if (!code || !mfaData?.temp_token) return;

    setVerifying(true);
    try {
      const form = new URLSearchParams();
      form.append("code", code);

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/user/enable_mfa_verify?temp_token=${mfaData.temp_token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: form,
        },
      );

      if (!res.ok) throw new Error("Verification failed");
      setMfaStatus("success");
      setMfaData(null);
      setCode("");
    } catch {
      setMfaStatus("error");
    } finally {
      setVerifying(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <Heading as="h1">Account Settings</Heading>

      {/* Profile card */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="mb-4 flex items-center gap-4">
          <img
            src={user?.avatar_url || "/default-user.jpg"}
            alt="avatar"
            className="border-brand-200 dark:border-brand-700 h-16 w-16 rounded-full border-2 object-cover"
          />
          <div>
            <p className="text-lg font-semibold dark:text-gray-100">
              {user?.fullName || "—"}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {user?.email}
            </p>
          </div>
        </div>
        <UpdateUserDataForm />
      </div>

      {/* Password */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <Heading as="h3">Change Password</Heading>
        <div className="mt-4">
          <UpdatePasswordForm />
        </div>
      </div>

      {/* MFA */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <Heading as="h3">Multi-Factor Authentication</Heading>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Add an extra layer of security with TOTP-based 2FA.
        </p>

        <div className="mt-4">
          {mfaStatus === "success" && (
            <p className="rounded-lg bg-green-50 p-3 text-sm font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400">
              MFA enabled successfully!
            </p>
          )}

          {user?.mfa_enabled && !mfaData && mfaStatus !== "success" && (
            <p className="bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-200 rounded-lg p-3 text-sm font-medium">
              MFA is currently enabled on your account.
            </p>
          )}

          {mfaData ? (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Scan the QR code with your authenticator app, then enter the
                6-digit code.
              </p>
              <img
                src={`${import.meta.env.VITE_API_BASE_URL}/user/mfa/qrcode?uri=${encodeURIComponent(mfaData.otpauth_uri)}`}
                alt="MFA QR code"
                className="h-44 w-44 rounded-lg border"
              />
              <form onSubmit={handleVerifyMfa} className="flex items-end gap-2">
                <Input
                  type="text"
                  placeholder="6-digit code"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-40"
                  required
                />
                <Button type="submit" disabled={verifying}>
                  {verifying ? "Verifying…" : "Verify & Enable"}
                </Button>
              </form>
              {mfaStatus === "error" && (
                <p className="text-sm text-red-500">
                  Invalid code. Please try again.
                </p>
              )}
            </div>
          ) : (
            !user?.mfa_enabled &&
            mfaStatus !== "success" && (
              <Button onClick={handleEnableMfa} className="mt-2">
                Enable MFA
              </Button>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default Account;
