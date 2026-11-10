const express = require("express");

const DEFAULT_DB_TIMEOUT_MS = 2_000;

function withTimeout(promise, ms) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Przekroczono limit ${ms} ms`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

/**
 * GET /health — sprawdza, czy API działa i czy odpowiada baza danych.
 * 200 gdy wszystko działa, 503 gdy baza nie odpowiada.
 * Szczegóły błędu trafiają tylko do logów serwera, nie do odpowiedzi.
 */
function createHealthRouter({ checkDatabase, timeoutMs = DEFAULT_DB_TIMEOUT_MS }) {
  const router = express.Router();

  router.get("/", async (req, res) => {
    let database = "ok";
    try {
      await withTimeout(Promise.resolve().then(checkDatabase), timeoutMs);
    } catch (err) {
      database = "error";
      console.error("Health check: baza danych nie odpowiada:", err.message);
    }

    const healthy = database === "ok";
    res.set("Cache-Control", "no-store");
    res.status(healthy ? 200 : 503).json({
      status: healthy ? "ok" : "error",
      services: { api: "ok", database },
      timestamp: new Date().toISOString(),
    });
  });

  return router;
}

module.exports = { createHealthRouter };
