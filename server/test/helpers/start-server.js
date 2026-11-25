const { createApp } = require("../../src/app");

/**
 * Uruchamia aplikację na losowym porcie i zwraca adres + funkcję zamykającą.
 * Zależność checkDatabase jest podmieniana, więc testy nie wymagają PostgreSQL.
 * `options` trafiają do createApp(), np. { healthTimeoutMs: 50 } skraca limit
 * czasu sprawdzenia bazy, żeby testy przekroczenia limitu działały szybko.
 */
async function startServer(checkDatabase = async () => {}, options = {}) {
  const app = createApp({ checkDatabase, ...options });
  const server = await new Promise((resolve) => {
    const s = app.listen(0, "127.0.0.1", () => resolve(s));
  });
  const { port } = server.address();
  return {
    url: `http://127.0.0.1:${port}`,
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}

module.exports = { startServer };
