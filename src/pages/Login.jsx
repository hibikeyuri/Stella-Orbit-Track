import { useState } from "react";

import Heading from "@/components/Heading";
import Logo from "@/components/Logo";
import LoginForm from "@/features/authentication/LoginForm";
import OAuthButtons from "@/features/authentication/OAuthButtons";
import RegisterForm from "@/features/authentication/RegisterForm";
import { Button } from "@/ui/button";

export default function Login() {
  const [mode, setMode] = useState("login"); // "login" | "register"

  return (
    <main className="grid min-h-screen [grid-template-columns:48rem] place-content-center gap-6 bg-gray-50">
      <Logo />

      <div className="rounded-xl bg-white p-8 shadow-sm">
        <Heading as="h1" className="mb-6 text-center">
          {mode === "login" ? "Sign in to your account" : "Create an account"}
        </Heading>

        {/* Form */}
        {mode === "login" ? <LoginForm /> : <RegisterForm />}

        {/* Divider */}
        <div className="my-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-sm text-gray-400">or</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        {/* OAuth */}
        <OAuthButtons />

        {/* Switch */}
        <div className="mt-6 text-center text-sm text-gray-600">
          {mode === "login" ? (
            <>
              Don’t have an account?{" "}
              <Button
                variant="link"
                className="px-0"
                onClick={() => setMode("register")}
              >
                Sign up
              </Button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Button
                variant="link"
                className="px-0"
                onClick={() => setMode("login")}
              >
                Sign in
              </Button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
