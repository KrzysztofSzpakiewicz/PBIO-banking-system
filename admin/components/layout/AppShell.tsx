"use client";

import { useState } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

type AppShellProps = {
  userName: string;
  userEmail: string;
  children: React.ReactNode;
};

/**
 * Wspólny układ strony: nagłówek u góry, menu po lewej (na telefonie
 * wysuwane), obszar treści po prawej.
 */
export function AppShell({ userName, userEmail, children }: AppShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        userName={userName}
        userEmail={userEmail}
        menuOpen={menuOpen}
        onToggleMenu={() => setMenuOpen((open) => !open)}
      />

      <div className="mx-auto flex w-full max-w-7xl flex-1">
        <Sidebar open={menuOpen} onNavigate={() => setMenuOpen(false)} />

        <main
          id="content"
          className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
