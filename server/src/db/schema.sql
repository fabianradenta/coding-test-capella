DROP TABLE IF EXISTS applications;
DROP TABLE IF EXISTS customers;

CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  identity_number VARCHAR(16) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers (id),
  application_type VARCHAR NOT NULL CHECK (
    application_type IN ('MOTORCYCLE', 'CAR', 'MULTIPURPOSE')
  ),
  requested_amount NUMERIC(15, 0) NOT NULL CHECK (requested_amount > 0),
  tenor INTEGER NOT NULL CHECK (tenor > 0),
  monthly_income NUMERIC(15, 0) NOT NULL CHECK (monthly_income >= 0),
  notes TEXT NOT NULL,
  monthly_payment NUMERIC(15, 0) NOT NULL,
  status VARCHAR NOT NULL DEFAULT 'PENDING' CHECK (
    status IN ('PENDING', 'APPROVED', 'REJECTED')
  ),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX applications_customer_id_idx ON applications (customer_id);

CREATE INDEX applications_submitted_at_idx ON applications (submitted_at DESC);
