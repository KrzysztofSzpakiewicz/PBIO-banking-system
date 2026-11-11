import "server-only";

/**
 * Wywołanie GET /health w Express — tylko po stronie serwera Next.js,
 * więc przeglądarka nie łączy się bezpośrednio z API (nie trzeba CORS).
 */

// Adres API — z client/.env.local (API_URL) albo domyślny z serwera deweloperskiego.
const API_URL = process.env.API_URL ?? "http://localhost:4000";
const TIMEOUT_MS = 3_000;

type ServiceState = "ok" | "error";

export type HealthCheck =
  | {
      reachable: true;
      healthy: boolean;
      httpStatus: number;
      services: { api: ServiceState; database: ServiceState };
      serverTime: string;
      latencyMs: number;
      checkedAt: string;
    }
  | {
      reachable: false;
      reason: "timeout" | "unreachable" | "invalid-response";
      latencyMs: number;
      checkedAt: string;
    };

type HealthResponse = {
  status: ServiceState;
  services: { api: ServiceState; database: ServiceState };
  timestamp: string;
};

function isServiceState(value: unknown): value is ServiceState {
  return value === "ok" || value === "error";
}

function isHealthResponse(value: unknown): value is HealthResponse {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  const services = v.services as Record<string, unknown> | undefined;
  return (
    isServiceState(v.status) &&
    typeof v.timestamp === "string" &&
    typeof services === "object" &&
    services !== null &&
    isServiceState(services.api) &&
    isServiceState(services.database)
  );
}

export async function checkApiHealth(): Promise<HealthCheck> {
  const started = Date.now();
  const checkedAt = new Date().toISOString();

  try {
    const res = await fetch(`${API_URL}/health`, {
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const latencyMs = Date.now() - started;
    const body: unknown = await res.json().catch(() => null);

    if (!isHealthResponse(body)) {
      return { reachable: false, reason: "invalid-response", latencyMs, checkedAt };
    }

    return {
      reachable: true,
      healthy: res.ok && body.status === "ok",
      httpStatus: res.status,
      services: body.services,
      serverTime: body.timestamp,
      latencyMs,
      checkedAt,
    };
  } catch (err) {
    const latencyMs = Date.now() - started;
    const timedOut = err instanceof DOMException && err.name === "TimeoutError";
    if (!timedOut) {
      console.error("Nie można połączyć się z API:", (err as Error).message);
    }
    return {
      reachable: false,
      reason: timedOut ? "timeout" : "unreachable",
      latencyMs,
      checkedAt,
    };
  }
}
