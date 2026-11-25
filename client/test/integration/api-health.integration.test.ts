import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import serverApp from "../../../server/src/app.js";
import databaseHelpers from "../../../server/test/helpers/database.js";

// Pełna ścieżka: checkApiHealth (Next.js) → HTTP → Express (server/) → PostgreSQL.
const { createApp } = serverApp;
const { assertDatabaseAvailable } = databaseHelpers;

describe("checkApiHealth z uruchomionym API i bazą danych", () => {
  let server: Server;
  let db: { pool: { end(): Promise<void> }; checkConnection(): Promise<void> };
  let checkApiHealth: typeof import("../../lib/api-health.ts").checkApiHealth;

  before(async () => {
    await assertDatabaseAvailable();
    // Moduł puli czyta DATABASE_URL przy imporcie — ładujemy go dopiero po sprawdzeniu bazy.
    db = (await import("../../../server/src/db/pool.js")).default;
    server = await new Promise<Server>((resolve) => {
      const s: Server = createApp({ checkDatabase: db.checkConnection }).listen(0, "127.0.0.1", () => resolve(s));
    });
    process.env.API_URL = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    ({ checkApiHealth } = await import("../../lib/api-health.ts"));
  });

  after(async () => {
    await new Promise((resolve) => server?.close(resolve));
    await db?.pool.end();
  });

  it("zwraca healthy=true i database=ok, gdy API i PostgreSQL działają", async () => {
    const result = await checkApiHealth();

    assert.equal(result.reachable, true);
    if (!result.reachable) return;
    assert.equal(result.healthy, true);
    assert.equal(result.httpStatus, 200);
    assert.deepEqual(result.services, { api: "ok", database: "ok" });
    assert.ok(!Number.isNaN(Date.parse(result.serverTime)));
  });
});
