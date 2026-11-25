const { describe, it, before, after } = require("node:test");
const assert = require("node:assert/strict");
const net = require("node:net");
const { startServer } = require("../helpers/start-server");

// Ta część nie wymaga uruchomionej bazy: w jej miejscu działa serwer TCP, który przyjmuje
// połączenie i nigdy nie odpowiada (np. przeciążona baza albo zerwana sieć).
describe("GET /health z bazą, która nie odpowiada", () => {
  const sockets = new Set();
  let fakeDatabase;
  let pool;
  let server;

  before(async () => {
    fakeDatabase = net.createServer((socket) => {
      sockets.add(socket);
      socket.on("close", () => sockets.delete(socket));
    });
    await new Promise((resolve) => fakeDatabase.listen(0, "127.0.0.1", resolve));

    const { port } = fakeDatabase.address();
    process.env.DATABASE_URL = `postgres://bank_app:change-me@127.0.0.1:${port}/bank`;
    const db = require("../../src/db/pool");
    pool = db.pool;
    server = await startServer(db.checkConnection);
  });

  after(async () => {
    await server?.close();
    for (const socket of sockets) socket.destroy();
    await new Promise((resolve) => fakeDatabase.close(resolve));
    await pool?.end();
  });

  it("zwraca 503 przed upływem 3 s, gdy PostgreSQL przyjmuje połączenie, ale nie odpowiada", async (t) => {
    t.mock.method(console, "error", () => {});
    const started = Date.now();

    const res = await fetch(`${server.url}/health`);
    const body = await res.json();

    assert.equal(res.status, 503);
    assert.deepEqual(body.services, { api: "ok", database: "error" });
    assert.ok(Date.now() - started < 3_000, "odpowiedź powinna przyjść po limicie 2 s z routes/health.js");
  });
});
