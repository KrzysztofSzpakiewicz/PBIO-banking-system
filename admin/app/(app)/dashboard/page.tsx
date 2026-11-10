import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { formatDate, formatPLN, plural } from "@/lib/format";
import { clients, operationsToday, rejectedToday, type Client } from "@/lib/mock-data";

export const metadata: Metadata = { title: "Pulpit" };

function StatTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

function StatusBadge({ status }: { status: Client["status"] }) {
  return status === "verified" ? (
    <span className="whitespace-nowrap rounded-full bg-positive/10 px-2 py-0.5 text-xs font-medium text-positive">
      Zweryfikowany
    </span>
  ) : (
    <span className="whitespace-nowrap rounded-full bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">
      Niepotwierdzony e-mail
    </span>
  );
}

function clientBalance(client: Client) {
  return client.accounts
    .filter((a) => a.status === "active")
    .reduce((sum, a) => sum + a.balanceGrosze, 0);
}

export default function AdminDashboardPage() {
  const allAccounts = clients.flatMap((c) => c.accounts);
  const activeAccounts = allAccounts.filter((a) => a.status === "active");
  const closedAccounts = allAccounts.length - activeAccounts.length;
  const totalBalance = clients.reduce((sum, c) => sum + clientBalance(c), 0);
  const pendingClients = clients.filter((c) => c.status === "pending").length;

  return (
    <>
      <PageHeader
        title="Pulpit administratora"
        description="Przegląd klientów i rachunków w środowisku demonstracyjnym."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Klienci"
          value={String(clients.length)}
          hint={`${pendingClients} z niepotwierdzonym e-mailem`}
        />
        <StatTile
          label="Aktywne rachunki"
          value={String(activeAccounts.length)}
          hint={`${closedAccounts} ${plural(closedAccounts, "zamknięty", "zamknięte", "zamkniętych")}`}
        />
        <StatTile
          label="Suma środków"
          value={formatPLN(totalBalance)}
          hint="Na aktywnych rachunkach"
        />
        <StatTile
          label="Operacje dziś"
          value={String(operationsToday)}
          hint={`${rejectedToday} ${plural(rejectedToday, "odrzucona", "odrzucone", "odrzuconych")}`}
        />
      </div>

      <Card
        title="Klienci i ich rachunki"
        className="mt-6"
        action={
          <Link href="/clients" className="text-sm font-medium text-brand hover:underline">
            Wszyscy klienci
          </Link>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-surface-muted/60 text-xs uppercase tracking-wide text-muted">
              <tr>
                <th scope="col" className="px-5 py-3 font-medium">Klient</th>
                <th scope="col" className="px-5 py-3 font-medium">Status</th>
                <th scope="col" className="px-5 py-3 font-medium">Rachunki</th>
                <th scope="col" className="px-5 py-3 text-right font-medium">Łączne saldo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {clients.map((client) => (
                <tr key={client.id} className="align-top">
                  <td className="px-5 py-4">
                    <p className="font-medium">
                      {client.firstName} {client.lastName}
                    </p>
                    <p className="text-xs text-muted">{client.email}</p>
                    <p className="mt-1 text-xs text-muted">
                      <span className="font-mono">{client.id}</span> · od{" "}
                      {formatDate(client.registeredAt)}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={client.status} />
                  </td>
                  <td className="px-5 py-4">
                    {client.accounts.length === 0 ? (
                      <span className="text-muted">Brak rachunków</span>
                    ) : (
                      <ul className="space-y-2.5">
                        {client.accounts.map((account) => {
                          const closed = account.status === "closed";
                          return (
                            <li key={account.id} className="flex items-start justify-between gap-6">
                              <div>
                                <p className="flex flex-wrap items-center gap-2">
                                  <span className={closed ? "text-muted" : ""}>{account.name}</span>
                                  {closed && (
                                    <span className="rounded-full bg-surface-muted px-2 py-0.5 text-xs font-medium text-muted">
                                      Zamknięty
                                    </span>
                                  )}
                                </p>
                                <p className="font-mono text-xs whitespace-nowrap text-muted">
                                  {account.id}
                                </p>
                              </div>
                              <span
                                className={`whitespace-nowrap tabular-nums ${closed ? "text-muted" : ""}`}
                              >
                                {formatPLN(account.balanceGrosze)}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right font-semibold tabular-nums whitespace-nowrap">
                    {formatPLN(clientBalance(client))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
