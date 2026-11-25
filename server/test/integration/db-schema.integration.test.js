const { describe, it, before, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const { requireEnv, connect, assertDatabaseAvailable } = require("../helpers/database");
const { runMigrations } = require("../../src/db/migrate");

// Sprawdza schemat z server/migrations/ po uruchomieniu runnera migracji (src/db/migrate.js).
// Każdy test działa w transakcji konta bank_app wycofywanej na końcu — nie zostawia danych.

describe("Schemat bazy po migracjach (server/migrations)", () => {
  let app;

  before(async () => {
    await assertDatabaseAvailable();
    // Idempotentne: na bazie z zastosowanymi migracjami nic nie zmienia.
    await runMigrations();
  });

  beforeEach(async () => {
    app = await connect(requireEnv("DATABASE_URL"));
    await app.query("BEGIN");
  });

  afterEach(async () => {
    await app?.query("ROLLBACK");
    await app?.end();
  });

  async function createAccount() {
    const email = `it-${process.pid}-${Date.now()}@example.com`;
    const { rows: users } = await app.query("INSERT INTO users (email) VALUES ($1) RETURNING id", [email]);
    const { rows: accounts } = await app.query(
      "INSERT INTO accounts (user_id, name) VALUES ($1, $2) RETURNING id, balance_grosze, currency, status",
      [users[0].id, "Rachunek testowy"],
    );
    return accounts[0];
  }

  it("tworzy rachunek z saldem 0 PLN i odrzuca ujemne saldo, gdy bank_app zapisuje dane", async () => {
    const account = await createAccount();

    assert.equal(account.balance_grosze, "0");
    assert.equal(account.currency, "PLN");
    assert.equal(account.status, "active");
    await assert.rejects(
      app.query("UPDATE accounts SET balance_grosze = $1 WHERE id = $2", [-1, account.id]),
      /violates check constraint/,
    );
  });

  it("odmawia zmiany i usunięcia zapisów historii operacji, gdy bank_app próbuje je edytować", async () => {
    const account = await createAccount();
    const { rows } = await app.query(
      `INSERT INTO ledger_entries (account_id, kind, direction, amount_grosze, balance_after_grosze)
       VALUES ($1, 'deposit', 'credit', $2, $2) RETURNING id`,
      [account.id, 10_000],
    );

    await app.query("SAVEPOINT before_update");
    await assert.rejects(
      app.query("UPDATE ledger_entries SET amount_grosze = $1 WHERE id = $2", [1, rows[0].id]),
      /permission denied for table ledger_entries/,
    );
    await app.query("ROLLBACK TO SAVEPOINT before_update");
    await assert.rejects(
      app.query("DELETE FROM ledger_entries WHERE id = $1", [rows[0].id]),
      /permission denied for table ledger_entries/,
    );
  });
});
