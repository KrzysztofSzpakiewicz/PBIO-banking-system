/**
 * Wspólna konfiguracja testów jednostkowych (ładowana przez `node --test --import`).
 *
 * 1. Stała strefa czasowa UTC — wyniki testów nie zależą od ustawień komputera
 *    i odpowiadają typowemu serwerowi (Docker, hosting), na którym renderuje się Next.js.
 * 2. Atrapa pakietu "server-only" — w Next.js chroni moduły serwerowe przed importem
 *    w przeglądarce; poza Next.js nie jest zainstalowany, więc w testach zastępujemy
 *    go pustym modułem.
 */
import { registerHooks } from "node:module";

process.env.TZ = "UTC";

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "server-only") {
      return { url: "data:text/javascript,export{}", format: "module", shortCircuit: true };
    }
    return nextResolve(specifier, context);
  },
});
