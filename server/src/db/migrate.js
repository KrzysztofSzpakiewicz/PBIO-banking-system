const fs = require("node:fs/promises");
const path = require("node:path");
const { Client } = require("pg");

const MIGRATIONS_DIR = path.join(__dirname, "..", "..", "migrations");
const LOCK_ID = 724301; // dowolna stała – blokada, żeby dwie instancje nie migrowały naraz

async function runMigrations() {
  const connectionString = process.env.MIGRATION_DATABASE_URL;
  if (!connectionString) {
    throw new Error("Brak zmiennej MIGRATION_DATABASE_URL – skopiuj .env.example do .env");
  }

  // osobne połączenie jako bank_migrator – konto aplikacji nie ma praw do DDL
  const client = new Client({ connectionString });
  await client.connect();

  try {
    await client.query("SELECT pg_advisory_lock($1)", [LOCK_ID]);

    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        name       text PRIMARY KEY,
        applied_at timestamptz NOT NULL DEFAULT now()
      )
    `);
    await client.query("REVOKE ALL ON schema_migrations FROM bank_app");

    const { rows } = await client.query("SELECT name FROM schema_migrations");
    const applied = new Set(rows.map((row) => row.name));

    const files = (await fs.readdir(MIGRATIONS_DIR))
      .filter((file) => file.endsWith(".sql"))
      .sort();

    for (const file of files) {
      if (applied.has(file)) continue;

      const sql = await fs.readFile(path.join(MIGRATIONS_DIR, file), "utf8");
      try {
        // DDL w PostgreSQL jest transakcyjne – migracja wchodzi w całości albo wcale
        await client.query("BEGIN");
        await client.query(sql);
        await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [file]);
        await client.query("COMMIT");
        console.log(`Zastosowano migrację: ${file}`);
      } catch (err) {
        await client.query("ROLLBACK");
        throw new Error(`Migracja ${file} nie powiodła się: ${err.message}`);
      }
    }
  } finally {
    await client.query("SELECT pg_advisory_unlock($1)", [LOCK_ID]).catch(() => {});
    await client.end();
  }
}

module.exports = { runMigrations };
