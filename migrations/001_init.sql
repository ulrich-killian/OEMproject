CREATE TABLE brands (
  id   integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text NOT NULL UNIQUE
);

CREATE TABLE models (
  id        integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  brand_id  integer NOT NULL REFERENCES brands(id),
  name      text NOT NULL,
  year_from smallint NOT NULL,
  year_to   smallint,
  CHECK (year_to IS NULL OR year_to >= year_from),
  UNIQUE (brand_id, name, year_from)
);

CREATE TABLE parts (
  id            integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  oem_number    text NOT NULL,
  search_number text NOT NULL UNIQUE,
  name          text NOT NULL,
  price_cents   integer NOT NULL CHECK (price_cents >= 0),
  stock         integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  weight_kg     numeric(8,2),
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE part_compatibility (
  part_id  integer NOT NULL REFERENCES parts(id)  ON DELETE CASCADE,
  model_id integer NOT NULL REFERENCES models(id) ON DELETE CASCADE,
  PRIMARY KEY (part_id, model_id)
);

CREATE INDEX idx_compat_model ON part_compatibility(model_id);