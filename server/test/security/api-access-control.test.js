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
//
// Testy oznaczone `todo` opisują błędy zgłoszone w issue #18 (do poprawy w issue #19).

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

  it(
    "wysyła nagłówek X-Content-Type-Options: nosniff, gdy odpowiada w formacie JSON",
    { todo: "Problem 2 z issue #18: brak nagłówka nosniff w odpowiedziach JSON" },
    async () => {
      const res = await fetch(`${server.url}/health`);

      assert.match(res.headers.get("content-type") ?? "", /application\/json/);
      assert.equal(res.headers.get("x-content-type-options"), "nosniff");
    },
  );

  it(
    "odrzuca treść większą niż 100 kB kodem 413 w formacie JSON bez śladu stosu",
    { todo: "Problem 1 z issue #18: odpowiedź 413 to strona HTML ze śladem stosu i ścieżkami serwera" },
    async (t) => {
      t.mock.method(console, "error", () => {});
      const res = await fetch(`${server.url}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "x".repeat(150 * 1024) }),
      });
      const text = await res.text();

      assert.equal(res.status, 413);
      assert.doesNotMatch(text, STACK_TRACE, "odpowiedź nie może ujawniać szczegółów implementacji");
      assert.match(res.headers.get("content-type") ?? "", /application\/json/);
    },
  );
});
