const { describe, it, before, after } = require("node:test");
const assert = require("node:assert/strict");
const net = require("node:net");
const { startServer } = require("../helpers/start-server");

// Ta część nie wymaga uruchomionej bazy: w jej miejscu działa serwer TCP, który przyjmuje
// połączenie i nigdy nie odpowiada (np. przeciążona baza albo zerwana sieć).
// Limit czasu jest skrócony z domyślnych 2 s, żeby test działał szybko.
const TIMEOUT_MS = 200;

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
    server = await startServer(db.checkConnection, { healthTimeoutMs: TIMEOUT_MS });
  });

  after(async () => {
    await server?.close();
    for (const socket of sockets) socket.destroy();
    await new Promise((resolve) => fakeDatabase.close(resolve));
    await pool?.end();
  });

  it("zwraca 503 po upływie limitu czasu, gdy PostgreSQL przyjmuje połączenie, ale nie odpowiada", async (t) => {
    t.mock.method(console, "error", () => {});
    const started = Date.now();

    const res = await fetch(`${server.url}/health`);
    const body = await res.json();

    assert.equal(res.status, 503);
    assert.deepEqual(body.services, { api: "ok", database: "error" });
    const elapsed = Date.now() - started;
    assert.ok(elapsed >= TIMEOUT_MS - 5, `odpowiedź przed upływem limitu (${elapsed} ms)`);
    assert.ok(elapsed < TIMEOUT_MS + 1_000, `odpowiedź długo po upływie limitu (${elapsed} ms)`);
  });
});
