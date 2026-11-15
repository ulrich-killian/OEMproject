CREATE TABLE counters (
  name  text PRIMARY KEY,
  value integer NOT NULL
);
INSERT INTO counters (name, value) VALUES ('invoice', 0);

CREATE TABLE orders (
  id               integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  public_token     text NOT NULL UNIQUE,
  status           text NOT NULL DEFAULT 'awaiting_payment'
    CHECK (status IN ('awaiting_payment','paid','packed','shipped','delivered','cancelled')),
  currency         char(3) NOT NULL DEFAULT 'USD',
  subtotal_cents   integer NOT NULL CHECK (subtotal_cents >= 0),
  shipping_cents   integer NOT NULL DEFAULT 0 CHECK (shipping_cents >= 0),
  total_cents      integer NOT NULL,
  buyer_name       text NOT NULL,
  buyer_email      text NOT NULL,
  buyer_phone      text NOT NULL,
  ship_line1       text NOT NULL,
  ship_line2       text,
  ship_city        text NOT NULL,
  ship_region      text,
  ship_postal_code text,
  ship_country     char(2) NOT NULL,
  created_at       timestamptz NOT NULL DEFAULT now(),
  CHECK (total_cents = subtotal_cents + shipping_cents)
);

CREATE TABLE order_items (
  id               integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id         integer NOT NULL REFERENCES orders(id),
  part_id          integer REFERENCES parts(id) ON DELETE SET NULL,
  oem_number       text NOT NULL,
  name             text NOT NULL,
  qty              integer NOT NULL CHECK (qty > 0),
  unit_price_cents integer NOT NULL CHECK (unit_price_cents >= 0),
  weight_kg        numeric(8,2)
);
CREATE INDEX idx_order_items_order ON order_items(order_id);

CREATE TABLE invoices (
  id             integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id       integer NOT NULL UNIQUE REFERENCES orders(id),
  invoice_number text NOT NULL UNIQUE,
  status         text NOT NULL DEFAULT 'issued'
    CHECK (status IN ('issued','paid','cancelled')),
  issued_at      timestamptz NOT NULL DEFAULT now(),
  paid_at        timestamptz
);

CREATE TABLE emails (
  id         integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id   integer REFERENCES orders(id),
  to_email   text NOT NULL,
  subject    text NOT NULL,
  body       text NOT NULL,
  status     text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','sent','failed')),
  attempts   integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  sent_at    timestamptz
);
CREATE INDEX idx_emails_pending ON emails(status) WHERE status = 'pending';