// Układ stron bez menu (logowanie, w przyszłości rejestracja).
export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      <div className="mb-8 flex items-center gap-2.5">
        <span className="grid size-10 place-items-center rounded-xl bg-brand font-bold text-brand-foreground">
          PB
        </span>
        <span className="text-xl font-semibold tracking-tight">PBIO Bank</span>
      </div>
      <main className="w-full max-w-sm">{children}</main>
      <p className="mt-8 max-w-sm text-center text-xs text-muted">
        Symulator bankowości internetowej. Wszystkie środki i operacje są fikcyjne.
      </p>
    </div>
  );
}
