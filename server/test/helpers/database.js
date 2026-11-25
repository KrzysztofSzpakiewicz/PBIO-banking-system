const { Client } = require("pg");

/**
 * Pomocnicze funkcje testów integracyjnych z prawdziwą bazą PostgreSQL
 * (uruchomioną przez `docker compose up -d db`, dane dostępowe z pliku .env).
 */

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Brak zmiennej ${name} – skopiuj .env.example do .env w katalogu głównym repozytorium`);
  }
  return value;
}

/** Adres bez hasła — do komunikatów błędów. */
function describeUrl(url) {
  const u = new URL(url);
  return `${u.username}@${u.host}${u.pathname}`;
}

/** Łączy się z bazą i zwraca klienta pg. Zamknięcie: `await client.end()`. */
async function connect(url) {
  const client = new Client({ connectionString: url, connectionTimeoutMillis: 3_000 });
  await client.connect();
  return client;
}

/** Zamienia nazwę bazy w adresie połączenia, np. bank → postgres. */
function withDatabase(url, database) {
  const u = new URL(url);
  u.pathname = `/${database}`;
  return u.toString();
}

/**
 * Sprawdza w `before()`, że baza działa. Bez tego testy kończyłyby się
 * mało czytelnym ECONNREFUSED.
 */
async function assertDatabaseAvailable(url = requireEnv("DATABASE_URL")) {
  let client;
  try {
    client = await connect(url);
  } catch (err) {
    throw new Error(
      `Brak połączenia z PostgreSQL (${describeUrl(url)}): ${err.message}. ` +
        "Uruchom bazę poleceniem `docker compose up -d db` albo użyj `npm run test:integration`.",
    );
  } finally {
    await client?.end();
  }
}

/** Unikalna nazwa tabeli testowej, żeby równoległe testy sobie nie przeszkadzały. */
function uniqueTableName(prefix = "it_test") {
  return `${prefix}_${process.pid}_${Date.now()}`;
}

module.exports = { requireEnv, connect, withDatabase, assertDatabaseAvailable, uniqueTableName };
