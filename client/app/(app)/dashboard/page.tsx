import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { PageHeader } from "@/components/ui/PageHeader";
import { formatDate, formatDateTime, formatPLN, plural } from "@/lib/format";
import { accounts, currentUser, recentOperations, type Account } from "@/lib/mock-data";

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

function AccountRow({ account }: { account: Account }) {
  const closed = account.status === "closed";
  return (
    <li className="flex items-center gap-4 px-5 py-4">
      <span
        className={`grid size-10 shrink-0 place-items-center rounded-lg ${
          closed ? "bg-surface-muted text-muted" : "bg-brand-soft text-brand"
        }`}
      >
        <Icon name="wallet" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-2 font-medium">
          <span className="truncate">{account.name}</span>
          {closed && (
            <span className="rounded-full bg-surface-muted px-2 py-0.5 text-xs font-medium text-muted">
              Zamknięty
            </span>
          )}
        </p>
        <p className="font-mono text-xs text-muted">{account.id}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className={`whitespace-nowrap font-semibold tabular-nums ${closed ? "text-muted" : ""}`}>
          {formatPLN(account.balanceGrosze)}
        </p>
        <p className="text-xs text-muted">od {formatDate(account.createdAt)}</p>
      </div>
    </li>
  );
}

export default function DashboardPage() {
  const activeAccounts = accounts.filter((a) => a.status === "active");
  const totalBalance = activeAccounts.reduce((sum, a) => sum + a.balanceGrosze, 0);
  const completed = recentOperations.filter((op) => op.result === "completed");
  const incoming = completed
    .filter((op) => op.direction === "in")
    .reduce((sum, op) => sum + op.amountGrosze, 0);
  const outgoing = completed
    .filter((op) => op.direction === "out")
    .reduce((sum, op) => sum + op.amountGrosze, 0);

  return (
    <>
      <PageHeader
        title={`Dzień dobry, ${currentUser.firstName}`}
        description="Podsumowanie Twoich rachunków i ostatnich operacji."
        actions={
          <>
            <Link
              href="/accounts"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3.5 py-2 text-sm font-medium hover:bg-surface-muted"
            >
              <Icon name="plus" className="size-4" />
              Nowy rachunek
            </Link>
            <Link
              href="/transfers"
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3.5 py-2 text-sm font-medium text-brand-foreground hover:bg-brand-hover"
            >
              <Icon name="transfer" className="size-4" />
              Nowy przelew
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile
          label="Łączne saldo"
          value={formatPLN(totalBalance)}
          hint={`${activeAccounts.length} ${plural(
            activeAccounts.length,
            "aktywny rachunek",
            "aktywne rachunki",
            "aktywnych rachunków",
          )}`}
        />
        <StatTile label="Wpływy (ostatnie operacje)" value={formatPLN(incoming)} />
        <StatTile label="Wydatki (ostatnie operacje)" value={formatPLN(outgoing)} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-5">
        <Card
          title="Twoje rachunki"
          className="min-w-0 xl:col-span-2"
          action={
            <Link href="/accounts" className="text-sm font-medium text-brand hover:underline">
              Wszystkie
            </Link>
          }
        >
          <ul className="divide-y divide-border">
            {accounts.map((account) => (
              <AccountRow key={account.id} account={account} />
            ))}
          </ul>
        </Card>

        <Card
          title="Ostatnie operacje"
          className="min-w-0 xl:col-span-3"
          action={
            <Link href="/history" className="text-sm font-medium text-brand hover:underline">
              Pełna historia
            </Link>
          }
        >
          <ul className="divide-y divide-border">
            {recentOperations.map((op) => {
              const incomingOp = op.direction === "in";
              const rejected = op.result === "rejected";
              return (
                <li key={op.id} className="flex items-center gap-4 px-5 py-3.5">
                  <span
                    className={`grid size-9 shrink-0 place-items-center rounded-full ${
                      rejected
                        ? "bg-surface-muted text-muted"
                        : incomingOp
                          ? "bg-positive/10 text-positive"
                          : "bg-negative/10 text-negative"
                    }`}
                  >
                    <Icon name={incomingOp ? "arrowIn" : "arrowOut"} className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    {/* Tytuł renderowany jako tekst — React escapuje HTML */}
                    <p className="truncate text-sm font-medium">{op.title}</p>
                    <p className="text-xs text-muted">
                      {formatDateTime(op.date)} ·{" "}
                      {incomingOp ? "od" : "do"}{" "}
                      <span className="font-mono">{op.counterpartyAccountId}</span>
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p
                      className={`whitespace-nowrap text-sm font-semibold tabular-nums ${
                        rejected
                          ? "text-muted line-through"
                          : incomingOp
                            ? "text-positive"
                            : ""
                      }`}
                    >
                      {formatPLN(incomingOp ? op.amountGrosze : -op.amountGrosze, {
                        signed: true,
                      })}
                    </p>
                    {rejected && (
                      <p className="text-xs font-medium text-negative">Odrzucony</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </>
  );
}
