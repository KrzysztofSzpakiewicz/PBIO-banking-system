const { createApp } = require("../../src/app");

/**
 * Uruchamia aplikację na losowym porcie i zwraca adres + funkcję zamykającą.
 * Zależność checkDatabase jest podmieniana, więc testy nie wymagają PostgreSQL.
 */
async function startServer(checkDatabase = async () => {}) {
  const app = createApp({ checkDatabase });
  const server = await new Promise((resolve) => {
    const s = app.listen(0, () => resolve(s));
  });
  const { port } = server.address();
  return {
    url: `http://127.0.0.1:${port}`,
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}

module.exports = { startServer };
