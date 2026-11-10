"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

// Ponownie renderuje stronę na serwerze, czyli wysyła nowe zapytanie do /health.
export function RefreshButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => startTransition(() => router.refresh())}
      disabled={pending}
      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3.5 py-2 text-sm font-medium hover:bg-surface-muted disabled:cursor-wait disabled:opacity-60"
    >
      {pending ? "Sprawdzanie…" : "Sprawdź ponownie"}
    </button>
  );
}
