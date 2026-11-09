#!/bin/sh
# Uruchamiany przez obraz postgres TYLKO przy pierwszym starcie (pusty volume).
set -eu

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
  -v migrator_pw="$DB_MIGRATOR_PASSWORD" -v app_pw="$DB_APP_PASSWORD" <<'EOSQL'
CREATE ROLE bank_migrator LOGIN PASSWORD :'migrator_pw';
CREATE ROLE bank_app LOGIN PASSWORD :'app_pw';

ALTER DATABASE :"DBNAME" OWNER TO bank_migrator;
REVOKE ALL ON DATABASE :"DBNAME" FROM PUBLIC;
GRANT CONNECT ON DATABASE :"DBNAME" TO bank_app;

ALTER SCHEMA public OWNER TO bank_migrator;
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO bank_app;

CREATE EXTENSION IF NOT EXISTS citext;

ALTER DEFAULT PRIVILEGES FOR ROLE bank_migrator IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO bank_app;
ALTER DEFAULT PRIVILEGES FOR ROLE bank_migrator IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO bank_app;
EOSQL
