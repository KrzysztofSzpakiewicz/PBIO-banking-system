import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Logowanie" };

export default function LoginPage() {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
      <h1 className="text-xl font-semibold tracking-tight">Zaloguj się</h1>
      <p className="mt-1 mb-6 text-sm text-muted">
        Wpisz adres e-mail i hasło, aby przejść do swoich rachunków.
      </p>
      <LoginForm redirectTo="/dashboard" />
      <p className="mt-6 text-center text-sm text-muted">
        Nie masz konta?{" "}
        {/* TODO: link do rejestracji, gdy powstanie widok */}
        <span className="font-medium text-brand">Rejestracja wkrótce</span>
      </p>
    </div>
  );
}
