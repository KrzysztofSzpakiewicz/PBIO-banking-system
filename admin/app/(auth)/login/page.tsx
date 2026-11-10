import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Logowanie" };

export default function LoginPage() {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
      <h1 className="text-xl font-semibold tracking-tight">Logowanie administratora</h1>
      <p className="mt-1 mb-6 text-sm text-muted">
        Wpisz służbowy adres e-mail i hasło, aby przejść do panelu.
      </p>
      <LoginForm redirectTo="/dashboard" />
    </div>
  );
}
