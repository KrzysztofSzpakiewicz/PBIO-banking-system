/**
 * Formatowanie kwot przechowywanych jako liczba całkowita groszy.
 * Nie dzielimy przez 100 na liczbach zmiennoprzecinkowych — złote i grosze
 * są wyliczane osobno na liczbach całkowitych (zgodnie z REQUIREMENTS.md).
 */
const groupFormatter = new Intl.NumberFormat("pl-PL", {
  useGrouping: true,
  maximumFractionDigits: 0,
});

export function formatPLN(grosze: number, options?: { signed?: boolean }): string {
  if (!Number.isInteger(grosze)) {
    throw new Error("Kwota musi być liczbą całkowitą groszy");
  }

  const abs = Math.abs(grosze);
  const zloty = Math.trunc(abs / 100);
  const rest = abs % 100;
  const sign = grosze < 0 ? "−" : options?.signed && grosze > 0 ? "+" : "";

  return `${sign}${groupFormatter.format(zloty)},${String(rest).padStart(2, "0")} PLN`;
}

/** Odmiana przez liczby: 1 rachunek, 2 rachunki, 5 rachunków. */
export function plural(n: number, one: string, few: string, many: string): string {
  if (n === 1) return one;
  const lastTwo = n % 100;
  const last = n % 10;
  if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) return few;
  return many;
}

const dateFormatter =new Intl.DateTimeFormat("pl-PL", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("pl-PL", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso));
}

export function formatDateTime(iso: string): string {
  return dateTimeFormatter.format(new Date(iso));
}
