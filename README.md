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
| `server/test/`, `client/test/` | testy jednostkowe (uruchamiane poleceniem `npm test`) |
| `test/setup.mjs`, `package.json` | wspólna konfiguracja i skrypty testów |
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

Wszystkie testy jednostkowe uruchamia jedno polecenie w katalogu głównym repozytorium:

```bash
npm test
```

Testy korzystają z wbudowanego w Node.js modułu `node:test` – nie wymagają dodatkowych pakietów, uruchomionej bazy danych ani serwera. Wystarczą zależności zainstalowane krokiem `npm ci --prefix server` z sekcji *Instalacja* oraz **Node.js ≥ 22.18** (pliki `.ts` są uruchamiane bez kompilacji).

| Polecenie | Działanie |
|---|---|
| `npm test` | wszystkie testy (API + biblioteki aplikacji klienta) |
| `npm run test:watch` | ponowne uruchamianie testów po każdej zmianie pliku |
| `npm run test:coverage` | testy z raportem pokrycia kodu |
| `npm test --prefix server` / `npm test --prefix client` | testy tylko jednej części |

**Struktura.** Testy leżą w katalogu `test/` danej części i odwzorowują strukturę kodu, np. `client/lib/format.ts` → `client/test/lib/format.test.ts`. Pliki pomocnicze (bez sufiksu `.test`) trafiają do `test/helpers/`. Wspólna konfiguracja (`test/setup.mjs` w katalogu głównym) ustawia strefę czasową UTC i podstawia pusty moduł za pakiet `server-only` z Next.js.

**Nazewnictwo.** Blok `describe` nazywa testowaną jednostkę (funkcję, moduł lub endpoint), a nazwa testu opisuje po polsku oczekiwany wynik i warunek, w schemacie *„<co robi>, gdy <warunek>”*, np.:

```
formatPLN › zgłasza błąd, gdy kwota przekracza zakres bezpiecznych liczb całkowitych
GET /health zwraca 503, gdy sprawdzenie bazy rzuca wyjątek synchronicznie
```

**Znane błędy.** Test, który wykrył błąd jeszcze niepoprawiony, ma opcję `{ todo: "Problem N z issue #16: …" }`. Jest uruchamiany i widoczny w raporcie jako `✖ … # Problem N…`, ale nie przerywa `npm test`. Po poprawieniu błędu należy usunąć opcję `todo` – od tej chwili test pilnuje, żeby błąd nie wrócił.

## Bezpieczeństwo konfiguracji

- Hasła i dane dostępowe znajdują się wyłącznie w pliku `.env`, nigdy w kodzie ani w repozytorium.
- API łączy się z bazą kontem `bank_app`, które może jedynie odczytywać i modyfikować dane – nie może tworzyć, zmieniać ani usuwać tabel. Zmiany struktury bazy wykonuje osobne konto `bank_migrator` (zasada minimalnych uprawnień).
- Port bazy danych jest dostępny wyłącznie z lokalnej maszyny (`127.0.0.1`).
- Wszystkie zapytania do bazy są parametryzowane.
