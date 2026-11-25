import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { formatDate, formatPLN, plural } from "../../lib/format.ts";

// Testy oznaczone `todo` opisują błędy zgłoszone w issue #16 (do poprawy w osobnym zadaniu).
// Są uruchamiane i raportowane, ale nie przerywają `npm test`. Po poprawce usuń opcję `todo`.

describe("formatPLN", () => {
  it("formatuje kwoty z kryterium akceptacji nr 3, gdy podano je w groszach", () => {
    assert.equal(formatPLN(10_000), "100,00 PLN");
    assert.equal(formatPLN(7_450), "74,50 PLN");
    assert.equal(formatPLN(2_550), "25,50 PLN");
    assert.equal(formatPLN(0), "0,00 PLN");
  });

  it(
    "zgłasza błąd, gdy kwota przekracza zakres bezpiecznych liczb całkowitych",
    { todo: "Problem 3 z issue #16: kwota jest po cichu zaokrąglana i wyświetlana błędnie" },
    () => {
      // 9 007 199 254 740 993 gr nie da się zapisać dokładnie w typie number.
      assert.throws(() => formatPLN(Number.MAX_SAFE_INTEGER + 2), /całkowitą/);
    },
  );
});

describe("plural", () => {
  it("dobiera formę rachunek/rachunki/rachunków zgodnie z polską odmianą przez liczby", () => {
    const form = (n: number) => plural(n, "rachunek", "rachunki", "rachunków");

    assert.equal(form(1), "rachunek");
    for (const n of [2, 3, 4, 22, 104]) assert.equal(form(n), "rachunki", `n = ${n}`);
    for (const n of [0, 5, 11, 12, 14, 21, 25, 112]) assert.equal(form(n), "rachunków", `n = ${n}`);
  });
});

describe("formatDate", () => {
  it(
    "pokazuje datę w strefie Europe/Warsaw, gdy serwer działa w strefie UTC",
    { todo: "Problem 4 z issue #16: data zależy od strefy czasowej serwera" },
    () => {
      // 23:30 UTC 9 listopada to już 00:30 10 listopada w Polsce.
      assert.equal(formatDate("2026-11-09T23:30:00Z"), "10.11.2026");
    },
  );
});
