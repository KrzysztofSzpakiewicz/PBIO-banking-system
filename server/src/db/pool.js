const { Pool } = require("pg");

if (!process.env.DATABASE_URL) {
  throw new Error("Brak zmiennej DATABASE_URL – skopiuj .env.example do .env");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

pool.on("error", (err) => {
  console.error("Błąd puli PostgreSQL:", err.message);
});

async function checkConnection() {
  await pool.query("SELECT 1");
}

// zawsze zapytania parametryzowane ($1, $2...), nigdy sklejanie stringów
const query = (text, params) => pool.query(text, params);

module.exports = { pool, query, checkConnection };
