import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import Heading from "@/components/Heading";
import Logo from "@/components/Logo";
import LoginForm from "@/features/authentication/LoginForm";
import OAuthButtons from "@/features/authentication/OAuthButtons";
import RegisterForm from "@/features/authentication/RegisterForm";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/ui/button";

export default function Login() {
  const [mode, setMode] = useState("login");
  const [searchParams] = useSearchParams();
  const toast = useToast();

  useEffect(() => {
    const verified = searchParams.get("verified");
    if (verified === "true") {
      toast.success(
        "Email verified!",
        "Your account has been verified. You can now sign in.",
      );
    } else if (verified === "false") {
      toast.error(
        "Verification failed",
        "The link may have expired. Please try again.",
      );
    }
  }, [searchParams, toast]);

  return (
    <main className="grid min-h-screen place-content-center gap-6 bg-gray-50 px-4 sm:[grid-template-columns:28rem] md:[grid-template-columns:36rem] lg:[grid-template-columns:48rem] dark:bg-gray-950">
      <Logo />

      <div className="rounded-xl bg-white p-8 shadow-sm dark:bg-gray-900">
        <Heading as="h1" className="mb-6 text-center dark:text-gray-100">
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
