const express = require("express");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Bank API is running",
  });
});

const { checkConnection } = require("./db/pool");
const { runMigrations } = require("./db/migrate");


const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await runMigrations();
    await checkConnection();
    console.log("Połączono z PostgreSQL");
  } catch (err) {
    console.error("Błąd inicjalizacji bazy danych:", err.message);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start();