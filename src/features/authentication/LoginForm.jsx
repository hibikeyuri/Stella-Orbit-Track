import { useState } from "react";

import { useLogin } from "./useLogin";

import Form from "@/components/Form";
import FormRow from "@/components/FormRow";
import SpinnerMini from "@/components/SpinnerMini";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";

function LoginForm() {
  const [email, setEmail] = useState("timse@example.com");
  const [password, setPassword] = useState("jhdj1352");
  const { login, isLoading } = useLogin();

  function handleSubmit(event) {
    event.preventDefault();
    if (!email || !password) return;
    login(
      { email, password },
      {
        onSettled: () => {
          setEmail("");
          setPassword("");
        },
      },
    );
  }

  return (
    <Form onSubmit={handleSubmit}>
      <FormRow label="Email Address" orientation="vertical">
        <Input
          type="email"
          id="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
        ></Input>
      </FormRow>

      <FormRow label="Password" orientation="vertical">
        <Input
          type="password"
          id="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
        ></Input>
      </FormRow>

      <FormRow orientation="vertical">
        <Button disabled={isLoading}>
          {console.log(isLoading)}
          {!isLoading ? "Login" : <SpinnerMini />}
        </Button>
      </FormRow>
    </Form>
  );
}

export default LoginForm;
