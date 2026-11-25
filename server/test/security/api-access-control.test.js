const { describe, it, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { startServer } = require("../helpers/start-server");

// Scenariusz bezpieczeństwa 2 — kontrola dostępu w API dla niezaufanego klienta.
//
// Zagrożenie: niezalogowany użytkownik albo obca strona internetowa próbuje odczytać
// odpowiedzi API z przeglądarki ofiary, rozpoznać technologię serwera lub przeciążyć API
// dużym żądaniem. Zgodnie z REQUIREMENTS.md („Dane rachunków nie mogą być udostępniane
// … przez komunikaty błędów ani publiczne endpointy”, kryterium akceptacji nr 10)
// API nie może ujawniać szczegółów implementacji.
// Błędy wykryte tymi testami opisano w issue #18 (Problemy 1, 2 i 6) i poprawiono w #19.

const STACK_TRACE = /Error:|node_modules|\bat \S+ \(/;

describe("Scenariusz bezpieczeństwa 2: niezaufany klient nie uzyska z API dostępu ani szczegółów serwera", () => {
  let server;

  before(async () => {
    server = await startServer();
  });

  after(async () => {
    await server?.close();
  });

  it("nie zezwala obcej domenie na odczyt odpowiedzi, gdy żądanie przychodzi z innego Origin", async () => {
    const res = await fetch(`${server.url}/health`, { headers: { Origin: "https://evil.example" } });

    assert.equal(res.status, 200);
    assert.equal(res.headers.get("access-control-allow-origin"), null);
    assert.equal(res.headers.get("access-control-allow-credentials"), null);
  });

  it("nie ujawnia technologii serwera w nagłówkach, gdy niezalogowany klient wywołuje API", async () => {
    const res = await fetch(`${server.url}/health`);

    assert.equal(res.status, 200);
    assert.equal(res.headers.get("x-powered-by"), null);
  });

  it("wysyła nagłówek X-Content-Type-Options: nosniff, gdy odpowiada w formacie JSON", async () => {
    const res = await fetch(`${server.url}/health`);

    assert.match(res.headers.get("content-type") ?? "", /application\/json/);
    assert.equal(res.headers.get("x-content-type-options"), "nosniff");
  });

  it("odrzuca treść większą niż 100 kB kodem 413 w formacie JSON bez śladu stosu", async () => {
    const res = await fetch(`${server.url}/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "x".repeat(150 * 1024) }),
    });
    const text = await res.text();

    assert.equal(res.status, 413);
    assert.doesNotMatch(text, STACK_TRACE, "odpowiedź nie może ujawniać szczegółów implementacji");
    assert.match(res.headers.get("content-type") ?? "", /application\/json/);
  });

  it("zwraca z /health tylko pola status, services i timestamp, gdy błąd bazy zawiera konto i adres serwera", async (t) => {
    const logError = t.mock.method(console, "error", () => {});
    const failingServer = await startServer(async () => {
      throw new Error('password authentication failed for user "bank_app" at db.internal:5432');
    });
    try {
      const res = await fetch(`${failingServer.url}/health`);
      const text = await res.text();
      const body = JSON.parse(text);

      assert.equal(res.status, 503);
      assert.deepEqual(Object.keys(body).sort(), ["services", "status", "timestamp"]);
      assert.doesNotMatch(text, /password|bank_app|db\.internal|5432/, "odpowiedź nie może zawierać treści błędu bazy");
      assert.equal(logError.mock.callCount(), 1, "szczegóły błędu powinny trafić do logów serwera");
    } finally {
      await failingServer.close();
    }
  });
});
