# System bankowy – PBIO

**Członkowie zespołu:** Jakub Guziel, Krzysztof Szpakiewicz, Jakub Kotuła
**Technologie:** Next.js (aplikacja klienta i panel administratora) + Express.js (API) + PostgreSQL

## Opis projektu

Celem projektu jest stworzenie aplikacji webowej symulującej działanie podstawowych mechanizmów bankowości elektronicznej.
Głównym założeniem systemu jest bezpieczny i intuicyjny proces onboardingu – użytkownicy mogą w kilku krokach otworzyć swój rachunek bankowy,
wykorzystując do rejestracji i autoryzacji wyłącznie adres e-mail.
System pozwoli na przelewy, zarządzanie rachunkiem, tworzenie nowych rachunków.

Aplikacja będzie symulatorem bankowości internetowej przeznaczonym dla osób chcących poznać podstawowe operacje bankowe bez używania prawdziwych pieniędzy. Po rejestracji i zalogowaniu za pomocą adresu e-mail użytkownik będzie mógł tworzyć rachunki, sprawdzać saldo, wykonywać przelewy fikcyjnych środków oraz przeglądać historię operacji. Projekt umożliwi naukę korzystania z bankowości elektronicznej w środowisku testowym.

Szczegółowe wymagania funkcjonalne i bezpieczeństwa: [REQUIREMENTS.md](REQUIREMENTS.md).

## Struktura repozytorium

| Ścieżka | Zawartość |
|---|---|
| `client/` | aplikacja klienta (Next.js) |
| `admin/` | panel administratora (Next.js) |
| `server/src/` | API (Express.js) |
| `server/test/`, `client/test/` | testy jednostkowe, integracyjne i scenariusze bezpieczeństwa (sekcja *Testy*) |
| `docs/RAPORT-TESTOW.md` | raport z wynikami testów |
| `test/setup.mjs`, `package.json` | wspólna konfiguracja i skrypty testów (jednostkowych i integracyjnych) |
| `db/init/` | skrypty inicjalizujące bazę danych (role i uprawnienia) |
| `docker-compose.yml` | baza danych PostgreSQL |
| `.env.example` | szablon konfiguracji (kopiowany do `.env`) |

## Wymagania środowiskowe

- **Node.js ≥ 22.18** (zalecana wersja 24 LTS) – serwer korzysta z flagi `--env-file-if-exists`, a testy uruchamiają pliki `.ts` bez kompilacji
- **npm** (instalowany razem z Node.js)
- **Docker** z Docker Compose v2 (polecenie `docker compose`)
- wolne porty: `3000`, `3001`, `4000`, `5432`

## Instalacja

```bash
git clone git@github.com:KrzysztofSzpakiewicz/PBIO-banking-system.git
cd PBIO-banking-system

cp .env.example .env

npm ci --prefix server
npm ci --prefix client
npm ci --prefix admin
```

Plik `.env` przechowuje konfigurację i hasła do bazy. Jest wykluczony z repozytorium (`.gitignore`) – w repozytorium znajduje się wyłącznie szablon `.env.example`. Domyślne hasła `change-me` są przeznaczone tylko do pracy lokalnej.

## Uruchomienie

Każde polecenie z kroków 2–4 uruchamiamy w osobnym terminalu, w katalogu głównym repozytorium.

**1. Baza danych**

```bash
docker compose up -d db
docker compose ps        # kolumna STATUS powinna pokazać "healthy"
```

Przy pierwszym uruchomieniu kontener automatycznie tworzy bazę `bank` oraz role `bank_migrator` i `bank_app` (skrypt `db/init/01-roles.sh`). Ręczna konfiguracja bazy nie jest potrzebna.

**2. API**

```bash
npm run dev --prefix server      # tryb deweloperski (restart po zmianie plików)
# lub
npm start --prefix server
```

Po poprawnym starcie w konsoli pojawi się `Połączono z PostgreSQL` oraz adres serwera. Jeśli baza jest niedostępna, serwer kończy działanie z komunikatem błędu.

**3. Aplikacja klienta**

```bash
npm run dev --prefix client
```

**4. Panel administratora**

```bash
npm run dev --prefix admin -- -p 3001
```

**Zatrzymanie**

```bash
docker compose down       # zatrzymanie bazy (dane zostają w wolumenie)
docker compose down -v    # zatrzymanie i usunięcie danych – baza zostanie utworzona od nowa przy kolejnym starcie
```

## Adresy aplikacji

| Usługa | Adres |
|---|---|
| Aplikacja klienta | http://localhost:3000 |
| Panel administratora | http://localhost:3001 |
| API | http://localhost:4000 |
| Status aplikacji (endpoint) | http://localhost:4000/health |
| Status aplikacji (strona) | http://localhost:3000/status, http://localhost:3001/status |
| PostgreSQL | `localhost:5432` (dostępny tylko z lokalnej maszyny) |

Aplikacje Next.js łączą się z API pod adresem ze zmiennej `API_URL` (domyślnie `http://localhost:4000`).

## Endpointy API

### `GET /health`

Sprawdza, czy aplikacja jest uruchomiona i czy odpowiada baza danych.

- dostępny bez logowania,
- sprawdzenie bazy ma limit czasu 2 s – endpoint nie zawiesza się przy niedziałającej bazie,
- odpowiedź nie jest cache'owana (`Cache-Control: no-store`),
- przy błędzie szczegóły trafiają wyłącznie do logów serwera, nie do odpowiedzi.

| Kod | Znaczenie |
|---|---|
| `200 OK` | API i baza danych działają |
| `503 Service Unavailable` | API działa, baza danych nie odpowiada |

Odpowiedź `200`:

```json
{
  "status": "ok",
  "services": { "api": "ok", "database": "ok" },
  "timestamp": "2026-11-11T19:00:00.000Z"
}
```

Odpowiedź `503`:

```json
{
  "status": "error",
  "services": { "api": "ok", "database": "error" },
  "timestamp": "2026-11-11T19:00:00.000Z"
}
```

### `GET /`

Zwraca informację, że API działa: `{"message": "Bank API is running"}`.

## Przykładowe żądania

Sprawdzenie statusu aplikacji:

```bash
curl -i http://localhost:4000/health
```

```
HTTP/1.1 200 OK
Cache-Control: no-store
Content-Type: application/json; charset=utf-8

{"status":"ok","services":{"api":"ok","database":"ok"},"timestamp":"2026-11-11T19:00:00.000Z"}
```

Zachowanie przy niedostępnej bazie danych:

```bash
docker compose stop db
curl -i http://localhost:4000/health     # HTTP/1.1 503 Service Unavailable, "database": "error"
docker compose start db
```

## Testy

Szczegółowy opis każdego testu i wyniki ostatniego uruchomienia: [docs/RAPORT-TESTOW.md](docs/RAPORT-TESTOW.md).

### Narzędzie

Testy korzystają z wbudowanego w Node.js modułu **`node:test`** (runner, `describe`/`it`, atrapy `t.mock`) oraz **`node:assert/strict`** (asercje). To odpowiednik Jest wbudowany w Node.js, więc testy nie wymagają dodatkowych pakietów. Pliki `.ts` aplikacji klienta są uruchamiane bez kompilacji (Node.js ≥ 22.18).

### Uruchomienie

Jedno polecenie uruchamia **wszystkie testy** (jednostkowe, endpointu, bezpieczeństwa i integracyjne). Wymaga Dockera i pliku `.env`, a bazę uruchamia samo:

```bash
npm run test:all
```

| Polecenie | Działanie | Wymaga bazy |
|---|---|---|
| `npm run test:all` | wszystkie testy: najpierw `npm test`, potem `npm run test:integration` | tak (uruchamia ją) |
| `npm test` | testy jednostkowe, test endpointu i scenariusz bezpieczeństwa 2 | nie |
| `npm run test:integration` | testy integracyjne i scenariusz bezpieczeństwa 1: uruchamia bazę (`docker compose up -d --wait db`) i wykonuje testy | tak (uruchamia ją) |
| `npm run test:integration:run` | jak wyżej, bez uruchamiania bazy (gdy baza już działa) | tak |
| `npm run test:security` | tylko oba scenariusze bezpieczeństwa (`server/test/security/`) | tak (uruchamia ją) |
| `npm run test:watch` | ponowne uruchamianie `npm test` po każdej zmianie pliku | nie |
| `npm run test:coverage` | `npm test` z raportem pokrycia kodu | nie |
| `npm test --prefix server` / `npm test --prefix client` | testy jednostkowe tylko jednej części | nie |

Do `npm test` wystarczą zależności z `npm ci --prefix server` (sekcja *Instalacja*). Testy integracyjne czytają dane dostępowe z `DATABASE_URL` i `MIGRATION_DATABASE_URL` w pliku `.env` (kopia `.env.example`).

### Zakres testów

| Rodzaj (wymóg etapu 3) | Liczba | Pliki |
|---|---|---|
| Testy jednostkowe (min. 8) | 10 | `server/test/app.test.js`, `server/test/health.test.js` (blok „GET /health przy niedziałającej bazie danych”), `client/test/lib/format.test.ts`, `client/test/lib/api-health.test.ts` |
| Testy integracyjne (min. 5) | 5 | `server/test/integration/*.integration.test.js`, `client/test/integration/api-health.integration.test.ts` |
| Scenariusze bezpieczeństwa (min. 2) | 2 (8 testów) | `server/test/security/db-privileges.integration.test.js`, `server/test/security/api-access-control.test.js` |
| Test endpointu (min. 1) | 1 | `server/test/health.test.js` (blok „Test endpointu: GET /health”) |

- **Jednostkowe** sprawdzają pojedyncze funkcje bez bazy i sieci: formatowanie kwot i dat, odmianę przez liczby, odczyt odpowiedzi `/health` przez aplikację klienta, obsługę błędów API (400, 404) i zachowanie `/health` przy niedziałającej bazie (błąd, przekroczenie limitu czasu, wyjątek). Sprawdzane są dane poprawne i błędne, np. poprawne kwoty i kwota poza zakresem w `formatPLN`, działająca i niedziałająca baza w `/health`.
- **Integracyjne** sprawdzają współpracę części systemu z prawdziwą bazą PostgreSQL z `docker-compose.yml`: API ↔ baza, uprawnienia ról z `db/init/01-roles.sh`, API ↔ baza, która przyjmuje połączenie, ale nie odpowiada, oraz aplikację klienta ↔ API ↔ baza.
- **Scenariusze bezpieczeństwa:**
  1. *Konto API `bank_app` nie może rozszerzyć swoich uprawnień w bazie:* nie przełączy się na `bank_migrator` ani `postgres`, nie nada sobie ról ani atrybutów i nie odczyta skrótów haseł ani plików serwera. Chroni przed skutkami przejęcia API lub wycieku `DATABASE_URL`.
  2. *Niezaufany klient nie uzyska z API dostępu ani szczegółów serwera:* obca domena nie odczyta odpowiedzi (CORS), API nie ujawnia technologii serwera, wysyła `nosniff`, odrzuca zbyt duże żądanie (413) bez śladu stosu, a `/health` nie ujawnia treści błędu bazy.
- **Test endpointu** sprawdza, czy `GET /health` zwraca kod `200` i `"status": "ok"`, gdy aplikacja jest uruchomiona. Ten sam endpoint z prawdziwą bazą sprawdza dodatkowo test integracyjny `health.integration.test.js`.

### Zasady

- **Osobny katalog.** Testy leżą w katalogu `test/` danej części i odwzorowują strukturę kodu, np. `client/lib/format.ts` → `client/test/lib/format.test.ts`. Testy integracyjne mają sufiks `.integration.test.*` i leżą w `test/integration/` (`npm test` je pomija), scenariusze bezpieczeństwa – w `server/test/security/`, pliki pomocnicze – w `test/helpers/`. Wspólna konfiguracja (`test/setup.mjs`) ustawia strefę czasową UTC i podstawia pusty moduł za pakiet `server-only` z Next.js.
- **Niezależność od danych i kolejności.** Każdy test tworzy własne dane: serwer API startuje na losowym porcie, a testy integracyjne tworzą tymczasowe tabele o unikalnych nazwach (`it_test_…`) i usuwają je po sobie. Każdy plik działa w osobnym procesie.
- **Bez zewnętrznych zasobów.** Testy nie łączą się z zewnętrznymi API, nie wysyłają e-maili i nie korzystają z produkcyjnej bazy – testy integracyjne używają lokalnej bazy z Dockera. Nie zawierają ścieżek zależnych od systemu operacyjnego.
- **Szybkość.** `npm test` trwa ok. 0,2 s, testy integracyjne – poniżej 1 s. Testy przekroczenia limitu czasu skracają go z 2 s do 50–200 ms (opcja `healthTimeoutMs` w `createApp`).
- **Brak plików wynikowych.** Testy nie zapisują plików. Ewentualny katalog `coverage/` jest wykluczony w `.gitignore`.
- **Bezpieczeństwo uprawnień.** Gdy test `nie może łączyć się z bazami innymi niż bank` nie przechodzi na istniejącej bazie, ma ona uprawnienia sprzed poprawki z issue #19. Skrypt `db/init/` działa tylko przy pierwszym starcie, więc trzeba utworzyć bazę od nowa (`docker compose down -v`, **usuwa dane**) albo wykonać poprawkę ręcznie:
  ```bash
  docker compose exec db psql -U postgres -d bank -c 'REVOKE CONNECT ON DATABASE postgres FROM PUBLIC' -c 'REVOKE CONNECT ON DATABASE template1 FROM PUBLIC'
  ```

**Nazewnictwo.** Blok `describe` nazywa testowaną jednostkę (funkcję, moduł, endpoint lub scenariusz bezpieczeństwa), a nazwa testu opisuje po polsku oczekiwany wynik i warunek w schemacie *„<co robi>, gdy <warunek>”*, np.:

```
formatPLN › zgłasza błąd, gdy kwota przekracza zakres bezpiecznych liczb całkowitych
GET /health przy niedziałającej bazie danych › zwraca 503 po upływie limitu czasu, gdy baza nie odpowiada wcale
```

**Znane błędy.** Test, który wykrył błąd jeszcze niepoprawiony, dostaje opcję `{ todo: "Problem N z issue #NN: …" }`. Jest uruchamiany i widoczny w raporcie jako `⚠ … # Problem N…`, ale nie przerywa `npm test`. Po poprawieniu błędu należy usunąć opcję `todo`. Obecnie wszystkie wykryte błędy są poprawione i żaden test nie ma tej opcji.

## Bezpieczeństwo konfiguracji

- Hasła i dane dostępowe znajdują się wyłącznie w pliku `.env`, nigdy w kodzie ani w repozytorium.
- API łączy się z bazą kontem `bank_app`, które może jedynie odczytywać i modyfikować dane – nie może tworzyć, zmieniać ani usuwać tabel. Zmiany struktury bazy wykonuje osobne konto `bank_migrator` (zasada minimalnych uprawnień).
- Konto `bank_app` może łączyć się wyłącznie z bazą `bank` – dostęp `PUBLIC` do baz systemowych `postgres` i `template1` jest odebrany.
- Port bazy danych jest dostępny wyłącznie z lokalnej maszyny (`127.0.0.1`).
- API odpowiada na błędy (400, 404, 413, 500) w formacie JSON, bez śladu stosu i szczegółów serwera, oraz wysyła nagłówek `X-Content-Type-Options: nosniff`.
- Wszystkie zapytania do bazy są parametryzowane.
