const { createApp } = require("./app");
const { checkConnection } = require("./db/pool");

const PORT = process.env.PORT || 4000;

const app = createApp({ checkDatabase: checkConnection });

async function start() {
  try {
    await checkConnection();
    console.log("Połączono z PostgreSQL");
  } catch (err) {
    console.error("Nie można połączyć się z bazą danych:", err.message);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start();
