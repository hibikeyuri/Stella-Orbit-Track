import Heading from "@/components/Heading";
import Logo from "@/components/Logo";
import LoginForm from "@/features/authentication/LoginForm";

export default function Login() {
  return (
    <main className="grid min-h-screen [grid-template-columns:48rem] place-content-center gap-8 bg-gray-50">
      <Logo />
      <LoginForm />
    </main>
  );
}
