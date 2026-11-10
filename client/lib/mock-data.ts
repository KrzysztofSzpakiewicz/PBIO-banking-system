/**
 * Przykładowe dane do widoków — do zastąpienia odpowiedziami z API (server/).
 * Kwoty są w groszach (liczby całkowite), waluta zawsze PLN.
 * Format identyfikatora rachunku nie jest jeszcze ustalony — poniższy jest roboczy.
 */

export type AccountStatus = "active" | "closed";

export type Account = {
  id: string;
  name: string;
  status: AccountStatus;
  balanceGrosze: number;
  currency: "PLN";
  createdAt: string;
};

export type OperationDirection = "in" | "out";
export type OperationResult = "completed" | "rejected";

export type Operation = {
  id: string;
  transferId: string;
  accountId: string;
  date: string;
  amountGrosze: number;
  currency: "PLN";
  direction: OperationDirection;
  counterpartyAccountId: string;
  title: string;
  result: OperationResult;
};

export type CurrentUser = {
  firstName: string;
  lastName: string;
  email: string;
};

export const currentUser: CurrentUser = {
  firstName: "Anna",
  lastName: "Kowalska",
  email: "anna.kowalska@example.com",
};

export const accounts: Account[] = [
  {
    id: "4821 0093 1175 0001",
    name: "Konto główne",
    status: "active",
    balanceGrosze: 1_245_050,
    currency: "PLN",
    createdAt: "2026-09-14T10:12:00Z",
  },
  {
    id: "4821 0093 1175 0002",
    name: "Oszczędności — wakacje",
    status: "active",
    balanceGrosze: 380_000,
    currency: "PLN",
    createdAt: "2026-10-02T08:40:00Z",
  },
  {
    id: "4821 0093 1175 0003",
    name: "Stare konto",
    status: "closed",
    balanceGrosze: 0,
    currency: "PLN",
    createdAt: "2026-09-20T16:05:00Z",
  },
];

export const recentOperations: Operation[] = [
  {
    id: "OP-000128",
    transferId: "TR-000064",
    accountId: "4821 0093 1175 0001",
    date: "2026-11-09T18:22:00Z",
    amountGrosze: 2_550,
    currency: "PLN",
    direction: "out",
    counterpartyAccountId: "7310 0042 8890 0004",
    title: "Zwrot za pizzę",
    result: "completed",
  },
  {
    id: "OP-000127",
    transferId: "TR-000063",
    accountId: "4821 0093 1175 0002",
    date: "2026-11-08T09:03:00Z",
    amountGrosze: 50_000,
    currency: "PLN",
    direction: "in",
    counterpartyAccountId: "4821 0093 1175 0001",
    title: "Odkładanie na wakacje",
    result: "completed",
  },
  {
    id: "OP-000126",
    transferId: "TR-000063",
    accountId: "4821 0093 1175 0001",
    date: "2026-11-08T09:03:00Z",
    amountGrosze: 50_000,
    currency: "PLN",
    direction: "out",
    counterpartyAccountId: "4821 0093 1175 0002",
    title: "Odkładanie na wakacje",
    result: "completed",
  },
  {
    id: "OP-000125",
    transferId: "TR-000062",
    accountId: "4821 0093 1175 0001",
    date: "2026-11-06T14:47:00Z",
    amountGrosze: 2_000_000,
    currency: "PLN",
    direction: "out",
    counterpartyAccountId: "1102 0077 5531 0001",
    title: "Za mieszkanie",
    result: "rejected",
  },
  {
    id: "OP-000124",
    transferId: "TR-000061",
    accountId: "4821 0093 1175 0001",
    date: "2026-11-05T11:15:00Z",
    amountGrosze: 120_000,
    currency: "PLN",
    direction: "in",
    counterpartyAccountId: "0000 0000 0000 0001",
    // Tytuł z HTML celowo — sprawdza, że jest wyświetlany jako tekst (kryterium 10).
    title: "<b>Zasilenie demo</b>",
    result: "completed",
  },
];
