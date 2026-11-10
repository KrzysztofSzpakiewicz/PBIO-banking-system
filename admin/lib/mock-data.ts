/**
 * Przykładowe dane panelu administratora — do zastąpienia odpowiedziami z API.
 * Kwoty w groszach (liczby całkowite), waluta PLN.
 * Format identyfikatora rachunku nie jest jeszcze ustalony — poniższy jest roboczy.
 */

export type AccountStatus = "active" | "closed";

export type ClientAccount = {
  id: string;
  name: string;
  status: AccountStatus;
  balanceGrosze: number;
};

export type ClientStatus = "verified" | "pending";

export type Client = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: ClientStatus;
  registeredAt: string;
  accounts: ClientAccount[];
};

export type CurrentUser = {
  firstName: string;
  lastName: string;
  email: string;
};

export const currentUser: CurrentUser = {
  firstName: "Administrator",
  lastName: "Demo",
  email: "admin@example.com",
};

export const operationsToday = 37;
export const rejectedToday = 3;

export const clients: Client[] = [
  {
    id: "USR-0001",
    firstName: "Anna",
    lastName: "Kowalska",
    email: "anna.kowalska@example.com",
    status: "verified",
    registeredAt: "2026-09-14T10:10:00Z",
    accounts: [
      { id: "4821 0093 1175 0001", name: "Konto główne", status: "active", balanceGrosze: 1_245_050 },
      { id: "4821 0093 1175 0002", name: "Oszczędności — wakacje", status: "active", balanceGrosze: 380_000 },
      { id: "4821 0093 1175 0003", name: "Stare konto", status: "closed", balanceGrosze: 0 },
    ],
  },
  {
    id: "USR-0002",
    firstName: "Piotr",
    lastName: "Nowak",
    email: "piotr.nowak@example.com",
    status: "verified",
    registeredAt: "2026-09-22T17:32:00Z",
    accounts: [
      { id: "7310 0042 8890 0004", name: "Konto osobiste", status: "active", balanceGrosze: 87_412 },
    ],
  },
  {
    id: "USR-0003",
    firstName: "Katarzyna",
    lastName: "Wiśniewska",
    email: "k.wisniewska@example.com",
    status: "verified",
    registeredAt: "2026-10-03T08:05:00Z",
    accounts: [
      { id: "1102 0077 5531 0001", name: "Konto", status: "active", balanceGrosze: 2_150_000 },
      { id: "1102 0077 5531 0002", name: "Firma", status: "active", balanceGrosze: 12_399 },
    ],
  },
  {
    id: "USR-0004",
    firstName: "Michał",
    lastName: "Zieliński",
    email: "michal.z@example.com",
    status: "pending",
    registeredAt: "2026-11-09T21:48:00Z",
    accounts: [],
  },
  {
    id: "USR-0005",
    firstName: "Zofia",
    lastName: "Lewandowska",
    email: "zofia.lewandowska@example.com",
    status: "verified",
    registeredAt: "2026-10-28T12:20:00Z",
    accounts: [
      { id: "5590 0011 2048 0001", name: "Konto główne", status: "active", balanceGrosze: 0 },
    ],
  },
];
