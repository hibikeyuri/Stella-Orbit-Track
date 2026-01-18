import { useState } from "react";
import { useNavigate } from "react-router";

import { useLogin } from "./useLogin";

import Form from "@/components/Form";
import FormRow from "@/components/FormRow";
import SpinnerMini from "@/components/SpinnerMini";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

function LoginForm() {
  const navigate = useNavigate();
  const { login, isLoading } = useLogin();

  const [email, setEmail] = useState("timse211@gmail.com");
  const [password, setPassword] = useState("1234");

  function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) return;

    login(
      { email, password },
      {
        onSuccess: (data) => {
          if (data.mfa_required && data.temp_token) {
            navigate(`/mfa?temp_token=${data.temp_token}`);
          }
        },
        onSettled: () => {
          setPassword("");
        },
      },
    );
  }

  return (
    <Form onSubmit={handleSubmit}>
      <FormRow label="Email" orientation="vertical">
        <Input
          type="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
        />
      </FormRow>

      <FormRow label="Password" orientation="vertical">
        <Input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
        />
      </FormRow>

      <FormRow orientation="vertical">
        <Button disabled={isLoading}>
          {isLoading ? <SpinnerMini /> : "Login"}
        </Button>
      </FormRow>
    </Form>
  );
}

export default LoginForm;
