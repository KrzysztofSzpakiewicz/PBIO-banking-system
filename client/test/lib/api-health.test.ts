import { describe, it } from "node:test";
import assert from "node:assert/strict";

process.env.API_URL = "http://api.test";
const { checkApiHealth } = await import("../../lib/api-health.ts");

describe("checkApiHealth", () => {
  it("zwraca reachable=true i healthy=false, gdy API odpowiada 503 z poprawną treścią", async (t) => {
    const body = {
      status: "error",
      services: { api: "ok", database: "error" },
      timestamp: "2026-11-25T12:00:00.000Z",
    };
    const fetchMock = t.mock.method(globalThis, "fetch", async () =>
      new Response(JSON.stringify(body), {
        status: 503,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const result = await checkApiHealth();

    assert.equal(fetchMock.mock.callCount(), 1);
    assert.equal(fetchMock.mock.calls[0].arguments[0], "http://api.test/health");
    assert.equal(result.reachable, true);
    if (!result.reachable) return;
    assert.equal(result.healthy, false);
    assert.equal(result.httpStatus, 503);
    assert.deepEqual(result.services, { api: "ok", database: "error" });
    assert.equal(result.serverTime, body.timestamp);
  });
});
