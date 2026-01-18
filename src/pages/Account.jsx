import { useState } from "react";

import UpdatePasswordForm from "../features/authentication/UpdatePasswordForm";
import UpdateUserDataForm from "../features/authentication/UpdateUserDataForm";

import Heading from "@/components/Heading";
import Row from "@/components/Row";
import { getEnableMfaPage } from "@/services/apiAuth";
import { Button } from "@/ui/button";

function Account() {
  const [mfaUri, setMfaUri] = useState(null);

  async function handleEnableMfa() {
    const data = await getEnableMfaPage();
    setMfaUri(data.otpauth_uri);
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
        <Heading as="h3">Enable MFA</Heading>
        {mfaUri ? (
          <div>
            <img
              src={`http://localhost:8000/user/mfa/qrcode?uri=${encodeURIComponent(mfaUri)}`}
              alt="MFA QR code"
            />
            <p>Scan this with your Authenticator app</p>
          </div>
        ) : (
          <Button onClick={handleEnableMfa}>Enable MFA</Button>
        )}
      </Row>
    </>
  );
}

export default Account;
