import { useState } from "react";
import { useNavigate } from "react-router";

import Form from "@/components/Form";
import FormRow from "@/components/FormRow";
import SpinnerMini from "@/components/SpinnerMini";
import { useToast } from "@/hooks/useToast";
import { apiFetch } from "@/services/http";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";

function RegisterForm() {
  const navigate = useNavigate();
  const toast = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);

    try {
      await apiFetch("/user/signup", {
        method: "POST",
        body: JSON.stringify(form),
      });

      toast.success("Account created", "Please login");
      navigate("/login");
    } catch (err) {
      toast.error(err.message, "Register failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form onSubmit={handleSubmit}>
      <FormRow label="Full name" orientation="vertical">
        <Input
          name="fullName"
          value={form.fullName}
          onChange={handleChange}
          disabled={isLoading}
        />
      </FormRow>

      <FormRow label="Email" orientation="vertical">
        <Input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          disabled={isLoading}
        />
      </FormRow>

      <FormRow label="Password" orientation="vertical">
        <Input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          disabled={isLoading}
        />
      </FormRow>

      <FormRow orientation="vertical">
        <Button disabled={isLoading}>
          {isLoading ? <SpinnerMini /> : "Create account"}
        </Button>
      </FormRow>
    </Form>
  );
}

export default RegisterForm;
