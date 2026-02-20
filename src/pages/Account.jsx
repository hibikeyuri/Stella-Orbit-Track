import { useState } from "react";

import UpdatePasswordForm from "../features/authentication/UpdatePasswordForm";
import UpdateUserDataForm from "../features/authentication/UpdateUserDataForm";

import Heading from "@/components/Heading";
import Row from "@/components/Row";
import { getEnableMfaPage } from "@/services/apiAuth";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";

function Account() {
  const [mfaData, setMfaData] = useState(null); // { otpauth_uri, temp_token }
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [mfaStatus, setMfaStatus] = useState(null); // "success" | "error"

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
    <>
      <Heading as="h1">Update your account</Heading>

      <Row>
        <Heading as="h3">Update user data</Heading>
        <UpdateUserDataForm />
      </Row>

      <Row>
        <Heading as="h3">Update password</Heading>
        <UpdatePasswordForm />
      </Row>

      <Row>
        <Heading as="h3">Multi-Factor Authentication</Heading>

        {mfaStatus === "success" && (
          <p className="text-sm font-medium text-green-600">
            MFA enabled successfully!
          </p>
        )}

        {mfaData ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-gray-600">
              Scan the QR code with your authenticator app, then enter the
              6-digit code to verify.
            </p>
            <img
              src={`${import.meta.env.VITE_API_BASE_URL}/user/mfa/qrcode?uri=${encodeURIComponent(mfaData.otpauth_uri)}`}
              alt="MFA QR code"
              className="h-44 w-44"
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
                {verifying ? "Verifying..." : "Verify & Enable"}
              </Button>
            </form>
            {mfaStatus === "error" && (
              <p className="text-sm text-red-500">
                Invalid code. Please try again.
              </p>
            )}
          </div>
        ) : (
          mfaStatus !== "success" && (
            <Button onClick={handleEnableMfa}>Enable MFA</Button>
          )
        )}
      </Row>
    </>
  );
}

export default Account;
