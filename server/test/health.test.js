const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { startServer } = require("./helpers/start-server");

// Krótki limit czasu sprawdzenia bazy — test przekroczenia limitu nie czeka domyślnych 2 s.
const FAST_TIMEOUT_MS = 50;

describe("Test endpointu: GET /health", () => {
  it("zwraca 200 i status „ok”, gdy aplikacja jest uruchomiona i baza odpowiada", async () => {
    const server = await startServer(async () => {});
    try {
      const res = await fetch(`${server.url}/health`);
      const body = await res.json();

      assert.equal(res.status, 200);
      assert.equal(body.status, "ok");
      assert.deepEqual(body.services, { api: "ok", database: "ok" });
      assert.ok(!Number.isNaN(Date.parse(body.timestamp)), "timestamp powinien być datą ISO 8601");
      assert.equal(res.headers.get("cache-control"), "no-store");
    } finally {
      await server.close();
    }
  });
});

describe("GET /health przy niedziałającej bazie danych", () => {
  it("zwraca 503 i status „error”, gdy sprawdzenie bazy kończy się błędem", async (t) => {
    t.mock.method(console, "error", () => {});
    const server = await startServer(async () => {
      throw new Error("connect ECONNREFUSED 127.0.0.1:5432");
    });
    try {
      const res = await fetch(`${server.url}/health`);
      const body = await res.json();

      assert.equal(res.status, 503);
      assert.equal(body.status, "error");
      assert.deepEqual(body.services, { api: "ok", database: "error" });
    } finally {
      await server.close();
    }
  });

  it("zwraca 503 po upływie limitu czasu, gdy baza nie odpowiada wcale", async (t) => {
    t.mock.method(console, "error", () => {});
    const server = await startServer(() => new Promise(() => {}), { healthTimeoutMs: FAST_TIMEOUT_MS });
    try {
      const started = Date.now();
      const res = await fetch(`${server.url}/health`);
      const elapsed = Date.now() - started;

      assert.equal(res.status, 503);
      assert.ok(elapsed >= FAST_TIMEOUT_MS - 5, `odpowiedź przed upływem limitu (${elapsed} ms)`);
      assert.ok(elapsed < 1_000, `odpowiedź długo po upływie limitu (${elapsed} ms)`);
    } finally {
      await server.close();
    }
  });

  it("zwraca 503 i zapisuje błąd w logach serwera, gdy sprawdzenie bazy rzuca wyjątek synchronicznie", async (t) => {
    const logError = t.mock.method(console, "error", () => {});
    const server = await startServer(() => {
      throw new Error("connect ECONNREFUSED 127.0.0.1:5432");
    });
    try {
      const res = await fetch(`${server.url}/health`);
      const body = await res.json();

      assert.equal(res.status, 503);
      assert.deepEqual(body.services, { api: "ok", database: "error" });
      assert.equal(logError.mock.callCount(), 1, "błąd powinien trafić do logów serwera");
    } finally {
      await server.close();
    }
  });
});
