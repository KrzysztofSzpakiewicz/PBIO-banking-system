import type { Metadata } from "next";
import { connection } from "next/server";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { RefreshButton } from "@/components/status/RefreshButton";
import { checkApiHealth, type HealthCheck } from "@/lib/api-health";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Status połączenia" };

type Tone = "ok" | "error" | "unknown";

const TONE_STYLES: Record<Tone, { dot: string; badge: string; label: string }> = {
  ok: { dot: "bg-positive", badge: "bg-positive/10 text-positive", label: "Działa" },
  error: { dot: "bg-negative", badge: "bg-negative/10 text-negative", label: "Błąd" },
  unknown: { dot: "bg-muted", badge: "bg-surface-muted text-muted", label: "Nieznany" },
};

const UNREACHABLE_MESSAGES: Record<Extract<HealthCheck, { reachable: false }>["reason"], string> = {
  timeout: "Serwer API nie odpowiedział w wyznaczonym czasie.",
  unreachable: "Nie można połączyć się z serwerem API. Sprawdź, czy działa (npm run dev w server/).",
  "invalid-response": "Serwer odpowiedział, ale w nieoczekiwanym formacie.",
};

function ServiceRow({ name, description, tone }: { name: string; description: string; tone: Tone }) {
  const style = TONE_STYLES[tone];
  return (
    <li className="flex items-center gap-4 px-5 py-4">
      <span aria-hidden="true" className={`size-2.5 shrink-0 rounded-full ${style.dot}`} />
      <div className="min-w-0 flex-1">
        <p className="font-medium">{name}</p>
        <p className="text-xs text-muted">{description}</p>
      </div>
      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${style.badge}`}>
        {style.label}
      </span>
    </li>
  );
}

export default async function StatusPage() {
  // Sprawdzenie ma się wykonywać przy każdym wejściu, nie podczas `next build`.
  await connection();
  const health = await checkApiHealth();

  const apiTone: Tone = health.reachable ? "ok" : "error";
  const dbTone: Tone = health.reachable
    ? health.services.database === "ok"
      ? "ok"
      : "error"
    : "unknown";
  const allOk = health.reachable && health.healthy;

  return (
    <>
      <PageHeader
        title="Status połączenia"
        description="Wynik zapytania GET /health wysłanego z Next.js do serwera Express."
        actions={<RefreshButton />}
      />

      <div
        role="status"
        className={`mb-6 rounded-xl border px-5 py-4 ${
          allOk
            ? "border-positive/30 bg-positive/10 text-positive"
            : "border-negative/30 bg-negative/10 text-negative"
        }`}
      >
        <p className="font-semibold">
          {allOk
            ? "Połączenie z serwerem działa poprawnie"
            : health.reachable
              ? "Serwer działa, ale baza danych nie odpowiada"
              : "Brak połączenia z serwerem"}
        </p>
        {!health.reachable && (
          <p className="mt-0.5 text-sm">{UNREACHABLE_MESSAGES[health.reason]}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card title="Usługi" className="min-w-0 lg:col-span-2">
          <ul className="divide-y divide-border">
            <ServiceRow name="Serwer API (Express)" description="GET /health" tone={apiTone} />
            <ServiceRow
              name="Baza danych (PostgreSQL)"
              description="Sprawdzana przez serwer API zapytaniem SELECT 1"
              tone={dbTone}
            />
          </ul>
        </Card>

        <Card title="Szczegóły" className="min-w-0">
          <dl className="space-y-3 px-5 py-4 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Sprawdzono</dt>
              <dd className="tabular-nums">{formatDateTime(health.checkedAt)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Czas odpowiedzi</dt>
              <dd className="tabular-nums">{health.latencyMs} ms</dd>
            </div>
            {health.reachable && (
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Kod HTTP</dt>
                <dd className="tabular-nums">{health.httpStatus}</dd>
              </div>
            )}
          </dl>
        </Card>
      </div>
    </>
  );
}
