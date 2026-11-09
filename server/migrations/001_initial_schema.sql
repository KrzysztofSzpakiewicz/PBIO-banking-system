-- Użytkownicy
CREATE TABLE users (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email             citext NOT NULL UNIQUE,
  email_verified_at timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT users_email_format CHECK (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$')
);

-- Rachunki (jeden właściciel, tylko PLN, kwoty w groszach)
CREATE TABLE accounts (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES users(id),
  name           varchar(50) NOT NULL CHECK (length(trim(name)) > 0),
  currency       char(3) NOT NULL DEFAULT 'PLN' CHECK (currency = 'PLN'),
  status         varchar(10) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  balance_grosze bigint NOT NULL DEFAULT 0 CHECK (balance_grosze >= 0),
  created_at     timestamptz NOT NULL DEFAULT now(),
  closed_at      timestamptz,
  CONSTRAINT accounts_closed_at_matches_status CHECK ((status = 'closed') = (closed_at IS NOT NULL)),
  CONSTRAINT accounts_closed_with_zero_balance CHECK (status = 'active' OR balance_grosze = 0)
);
CREATE INDEX accounts_user_id_idx ON accounts (user_id);

-- Zlecenia przelewów (wykonane i odrzucone)
CREATE TABLE transfers (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  initiator_user_id uuid NOT NULL REFERENCES users(id),
  from_account_id   uuid NOT NULL REFERENCES accounts(id),
  to_account_id     uuid NOT NULL REFERENCES accounts(id),
  amount_grosze     bigint NOT NULL CHECK (amount_grosze > 0),
  title             varchar(140) NOT NULL CHECK (length(trim(title)) > 0),
  status            varchar(10) NOT NULL CHECK (status IN ('completed', 'rejected')),
  rejection_reason  text,
  idempotency_key   uuid NOT NULL,
  request_hash      char(64) NOT NULL,
  created_at        timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT transfers_different_accounts CHECK (from_account_id <> to_account_id),
  CONSTRAINT transfers_reason_only_when_rejected CHECK ((status = 'rejected') = (rejection_reason IS NOT NULL)),
  CONSTRAINT transfers_idempotency_unique UNIQUE (initiator_user_id, idempotency_key)
);

-- Historia operacji na rachunkach (zapisy księgowe)
CREATE TABLE ledger_entries (
  id                   bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  account_id           uuid NOT NULL REFERENCES accounts(id),
  kind                 varchar(10) NOT NULL CHECK (kind IN ('transfer', 'deposit')),
  transfer_id          uuid REFERENCES transfers(id),
  direction            varchar(6) NOT NULL CHECK (direction IN ('debit', 'credit')),
  amount_grosze        bigint NOT NULL CHECK (amount_grosze > 0),
  balance_after_grosze bigint NOT NULL CHECK (balance_after_grosze >= 0),
  created_at           timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ledger_transfer_id_matches_kind CHECK ((kind = 'transfer') = (transfer_id IS NOT NULL)),
  CONSTRAINT ledger_deposit_is_credit CHECK (kind = 'transfer' OR direction = 'credit'),
  CONSTRAINT ledger_one_entry_per_side UNIQUE (transfer_id, direction)
);
CREATE INDEX ledger_entries_account_created_idx ON ledger_entries (account_id, created_at DESC);

-- Zapisy finansowe są niemodyfikowalne dla konta aplikacji
REVOKE UPDATE, DELETE ON transfers, ledger_entries FROM bank_app;
