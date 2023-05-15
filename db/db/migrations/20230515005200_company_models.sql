-- migrate:up
CREATE TABLE
  IF NOT EXISTS company (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    company_id int UNIQUE NOT NULL,
    raw_company_name text CHECK (char_length(raw_company_name) <= 1024) NOT NULL,
    processed_company_name text CHECK (char_length(processed_company_name) <= 1024) NOT NULL,
    headcount int CHECK (headcount > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW ()
  );

CREATE TABLE
  IF NOT EXISTS company_acquisition (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    parent_company_id int NOT NULL,
    acquired_company_id int NOT NULL,
    --  This is a unique constraint to prevent A acquires B and B acquires B from existing 
    -- can easily get rid of this, just thought it would be fun
    company_ids_integrity_token text UNIQUE NOT NULL,
    merged_into_parent_company boolean NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW ()
  );

CREATE UNIQUE INDEX IF NOT EXISTS "company_acquisition_idx" ON "company_acquisition" ("parent_company_id", "acquired_company_id");

CREATE TABLE
  IF NOT EXISTS person_employment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    person_id int NOT NULL,
    company_id int NOT NULL,
    raw_employment_title text CHECK (char_length(raw_employment_title) <= 1024) NOT NULL,
    processed_employment_title text CHECK (char_length(processed_employment_title) <= 1024) NOT NULL,
    start_date TIMESTAMPTZ,
    end_date DATE CHECK (end_date >= start_date),
    created_at DATE NOT NULL DEFAULT NOW ()
  );

CREATE UNIQUE INDEX IF NOT EXISTS "person_employment_idx" ON "person_employment" (
  "person_id",
  "company_id",
  "start_date",
  "end_date"
);

-- migrate:down
DROP TABLE IF EXISTS company;

DROP TABLE IF EXISTS company_acquisition;

DROP TABLE IF EXISTS person_employment;
