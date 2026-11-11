const { test } = require("node:test");
const assert = require("node:assert/strict");
const { createApp } = require("../src/app");

// Uruchamia aplikację na losowym porcie i zwraca adres + funkcję zamykającą.
async function startServer(checkDatabase) {
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

test("GET /health zwraca 200, gdy baza odpowiada", async () => {
  const server = await startServer(async () => {});
  try {
    const res = await fetch(`${server.url}/health`);
    const body = await res.json();

    assert.equal(res.status, 200);
    assert.equal(res.headers.get("cache-control"), "no-store");
    assert.equal(body.status, "ok");
    assert.deepEqual(body.services, { api: "ok", database: "ok" });
    assert.ok(!Number.isNaN(Date.parse(body.timestamp)));
  } finally {
    await server.close();
  }
});

test("GET /health zwraca 503 i nie ujawnia błędu, gdy baza nie odpowiada", async () => {
  const server = await startServer(async () => {
    throw new Error("password authentication failed for user bank_app");
  });
  try {
    const res = await fetch(`${server.url}/health`);
    const text = await res.text();
    const body = JSON.parse(text);

    assert.equal(res.status, 503);
    assert.equal(body.status, "error");
    assert.deepEqual(body.services, { api: "ok", database: "error" });
    assert.ok(!text.includes("password"), "odpowiedź nie może zawierać treści błędu bazy");
  } finally {
    await server.close();
  }
});

test("GET /health nie wisi, gdy baza nie odpowiada w ogóle", async () => {
  const server = await startServer(() => new Promise(() => {}));
  try {
    const started = Date.now();
    const res = await fetch(`${server.url}/health`);
    assert.equal(res.status, 503);
    assert.ok(Date.now() - started < 5_000);
  } finally {
    await server.close();
  }
});
