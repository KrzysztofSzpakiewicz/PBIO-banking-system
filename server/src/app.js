const express = require("express");
const { createHealthRouter } = require("./routes/health");

// Komunikaty zwracane klientowi. Szczegóły błędu (komunikat, ślad stosu) trafiają
// wyłącznie do logów serwera — odpowiedź nie może ujawniać implementacji.
const CLIENT_ERROR_MESSAGES = {
  400: "Niepoprawna treść żądania",
  404: "Nie znaleziono zasobu",
  413: "Treść żądania jest zbyt duża",
  415: "Nieobsługiwany format treści żądania",
};

function sendError(res, status) {
  const message = CLIENT_ERROR_MESSAGES[status] ?? (status < 500 ? "Błędne żądanie" : "Wewnętrzny błąd serwera");
  res.status(status).json({ error: message });
}

/**
 * Tworzy aplikację Express. Zależności (np. sprawdzanie bazy) są przekazywane
 * z zewnątrz, żeby dało się ją testować bez prawdziwego PostgreSQL.
 *
 * @param {object} options
 * @param {() => unknown} options.checkDatabase sprawdzenie połączenia z bazą (GET /health)
 * @param {number} [options.healthTimeoutMs] limit czasu sprawdzenia bazy, domyślnie 2000 ms
 */
function createApp({ checkDatabase, healthTimeoutMs }) {
  const app = express();

  app.disable("x-powered-by");

  // Przeglądarka nie może zgadywać typu treści odpowiedzi (MIME sniffing).
  app.use((req, res, next) => {
    res.set("X-Content-Type-Options", "nosniff");
    next();
  });

  app.use(express.json());

  app.get("/", (req, res) => {
    res.json({
      message: "Bank API is running",
    });
  });

  app.use("/health", createHealthRouter({ checkDatabase, timeoutMs: healthTimeoutMs }));

  app.use((req, res) => {
    sendError(res, 404);
  });

  // Express rozpoznaje obsługę błędów po 4 parametrach.
  app.use((err, req, res, next) => {
    const status = Number.isInteger(err.status) && err.status >= 400 && err.status < 600 ? err.status : 500;
    if (status >= 500) {
      console.error(`Nieobsłużony błąd ${req.method} ${req.path}:`, err);
    }
    if (res.headersSent) {
      // Odpowiedź jest już w trakcie wysyłania — domyślna obsługa Express zamknie połączenie.
      next(err);
      return;
    }
    sendError(res, status);
  });

  return app;
}

module.exports = { createApp };
