const { describe, it, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { startServer } = require("../helpers/start-server");
const { assertDatabaseAvailable } = require("../helpers/database");

describe("GET /health z prawdziwą bazą PostgreSQL", () => {
  let pool;
  let server;

  before(async () => {
    await assertDatabaseAvailable();
    // Moduł puli czyta DATABASE_URL przy imporcie — ładujemy go dopiero po sprawdzeniu bazy.
    const db = require("../../src/db/pool");
    pool = db.pool;
    server = await startServer(db.checkConnection);
  });

  after(async () => {
    await server?.close();
    await pool?.end();
  });

  it("zwraca 200 i database=ok, gdy API łączy się z bazą kontem z DATABASE_URL", async () => {
    const res = await fetch(`${server.url}/health`);
    const body = await res.json();

    assert.equal(res.status, 200);
    assert.equal(body.status, "ok");
    assert.deepEqual(body.services, { api: "ok", database: "ok" });
  });
});
