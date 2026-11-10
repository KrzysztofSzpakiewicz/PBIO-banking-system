const express = require("express");
const { createHealthRouter } = require("./routes/health");

/**
 * Tworzy aplikację Express. Zależności (np. sprawdzanie bazy) są przekazywane
 * z zewnątrz, żeby dało się ją testować bez prawdziwego PostgreSQL.
 */
function createApp({ checkDatabase }) {
  const app = express();

  app.disable("x-powered-by");
  app.use(express.json());

  app.get("/", (req, res) => {
    res.json({
      message: "Bank API is running",
    });
  });

  app.use("/health", createHealthRouter({ checkDatabase }));

  return app;
}

module.exports = { createApp };
