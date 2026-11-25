const { describe, it, before, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const { requireEnv, connect, assertDatabaseAvailable } = require("../helpers/database");

// Scenariusz bezpieczeństwa 1 — kontrola dostępu w bazie danych.
//
// Zagrożenie: atakujący przejmuje API (np. przez błąd w kodzie albo wyciek DATABASE_URL)
// i działa z uprawnieniami konta bank_app. Zgodnie z README i REQUIREMENTS.md
// („Konto bazy używane przez API ma minimalny niezbędny zakres uprawnień”) takie konto
// nie może rozszerzyć swoich uprawnień ani sięgnąć po dane spoza swojego zakresu.

describe("Scenariusz bezpieczeństwa 1: konto API bank_app nie może rozszerzyć swoich uprawnień w bazie", () => {
  let app;

  before(async () => {
    await assertDatabaseAvailable();
  });

  beforeEach(async () => {
    app = await connect(requireEnv("DATABASE_URL"));
  });

  afterEach(async () => {
    await app?.end();
  });

  it("odmawia przełączenia na konto bank_migrator lub postgres, gdy bank_app wykona SET ROLE", async () => {
    for (const role of ["bank_migrator", "postgres"]) {
      await assert.rejects(
        app.query(`SET ROLE ${role}`),
        /permission denied to set role/,
        `bank_app nie może działać jako ${role}`,
      );
    }
  });

  it("odmawia nadania sobie ról i atrybutów, gdy bank_app wykona GRANT, ALTER ROLE lub CREATE ROLE", async () => {
    await assert.rejects(app.query("GRANT bank_migrator TO bank_app"), /permission denied to grant role/);
    await assert.rejects(app.query("ALTER ROLE bank_app SUPERUSER"), /permission denied to alter role/);
    await assert.rejects(app.query("CREATE ROLE it_attacker LOGIN SUPERUSER"), /permission denied to create role/);
  });

  it("odmawia odczytu skrótów haseł i plików serwera, gdy bank_app odpyta katalog systemowy", async () => {
    await assert.rejects(app.query("SELECT rolpassword FROM pg_authid"), /permission denied for table pg_authid/);
    await assert.rejects(app.query("SELECT pg_read_file('postgresql.conf')"), /permission denied for function pg_read_file/);
    await assert.rejects(app.query("COPY (SELECT 1) TO PROGRAM 'id'"), /permission denied to COPY to or from an external program/);
  });
});
