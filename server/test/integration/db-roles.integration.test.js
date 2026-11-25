const { describe, it, before, after } = require("node:test");
const assert = require("node:assert/strict");
const {
  requireEnv,
  connect,
  withDatabase,
  assertDatabaseAvailable,
  uniqueTableName,
} = require("../helpers/database");

// Sprawdza uprawnienia nadane przez db/init/01-roles.sh (zasada minimalnych uprawnień z README).
// Testy oznaczone `todo` opisują błędy zgłoszone w issue #17 (do poprawy w osobnym zadaniu).

describe("Uprawnienia konta bank_app (db/init/01-roles.sh)", () => {
  const table = uniqueTableName();
  let appUrl;
  let migrator;

  before(async () => {
    appUrl = requireEnv("DATABASE_URL");
    await assertDatabaseAvailable(appUrl);
    migrator = await connect(requireEnv("MIGRATION_DATABASE_URL"));
    await migrator.query(
      `CREATE TABLE ${table} (id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, balance_grosze bigint NOT NULL)`,
    );
  });

  after(async () => {
    await migrator?.query(`DROP TABLE IF EXISTS ${table}`);
    await migrator?.end();
  });

  it("odczytuje i modyfikuje dane w tabelach bank_migrator, ale nie może zmieniać struktury bazy", async () => {
    const app = await connect(appUrl);
    try {
      const { rows } = await app.query(
        `INSERT INTO ${table} (balance_grosze) VALUES ($1) RETURNING id`,
        [10_000],
      );
      await app.query(`UPDATE ${table} SET balance_grosze = $1 WHERE id = $2`, [7_450, rows[0].id]);
      const selected = await app.query(`SELECT balance_grosze FROM ${table} WHERE id = $1`, [rows[0].id]);
      assert.equal(selected.rows[0].balance_grosze, "7450");
      await app.query(`DELETE FROM ${table} WHERE id = $1`, [rows[0].id]);

      await assert.rejects(app.query("CREATE TABLE it_forbidden (id int)"), /permission denied/);
      await assert.rejects(app.query(`ALTER TABLE ${table} ADD COLUMN extra int`), /must be owner/);
      await assert.rejects(app.query(`TRUNCATE ${table}`), /permission denied/);
      await assert.rejects(app.query(`DROP TABLE ${table}`), /must be owner/);
    } finally {
      await app.end();
    }
  });

  it(
    "nie może łączyć się z bazami innymi niż bank, gdy podaje poprawne hasło",
    { todo: "Problem 1 z issue #17: bank_app łączy się z bazami postgres i template1" },
    async () => {
      for (const database of ["postgres", "template1"]) {
        await assert.rejects(
          connect(withDatabase(appUrl, database)).then((client) => client.end()),
          /permission denied for database/,
          `bank_app nie powinien mieć dostępu do bazy ${database}`,
        );
      }
    },
  );
});
