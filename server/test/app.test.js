const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { startServer } = require("./helpers/start-server");

// Błędy wykryte tymi testami (Problemy 1 i 2 z issue #16) poprawiono w issue #19.

describe("Obsługa błędów API", () => {
  it("zwraca 400 w formacie JSON bez śladu stosu, gdy treść żądania nie jest poprawnym JSON-em", async () => {
    const server = await startServer();
    try {
      const res = await fetch(`${server.url}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: '{"amount": 25.50,',
      });
      const text = await res.text();

      assert.equal(res.status, 400);
      assert.doesNotMatch(text, /SyntaxError|node_modules|\bat \S+ \(/, "odpowiedź nie może ujawniać szczegółów implementacji");
      assert.match(res.headers.get("content-type") ?? "", /application\/json/);
    } finally {
      await server.close();
    }
  });

  it("zwraca 404 w formacie JSON, gdy ścieżka nie istnieje", async () => {
    const server = await startServer();
    try {
      const res = await fetch(`${server.url}/nie-ma-takiej-sciezki`);

      assert.equal(res.status, 404);
      assert.match(res.headers.get("content-type") ?? "", /application\/json/);
    } finally {
      await server.close();
    }
  });
});
