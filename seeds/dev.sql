INSERT INTO brands (name) VALUES ('Toyota'), ('Honda')
ON CONFLICT (name) DO NOTHING;

INSERT INTO models (brand_id, name, year_from, year_to)
SELECT b.id, v.name, v.year_from, v.year_to
FROM (VALUES
  ('Toyota', 'Corolla', 2008, 2013),
  ('Toyota', 'Camry',   2010, 2011),
  ('Honda',  'Civic',   2012, 2015)
) AS v(brand, name, year_from, year_to)
JOIN brands b ON b.name = v.brand
ON CONFLICT (brand_id, name, year_from) DO NOTHING;

INSERT INTO parts (oem_number, search_number, name, price_cents, stock, weight_kg) VALUES
  ('BP-123', 'bp123', 'Front brake pad set', 4999, 12, 1.20),
  ('OF-200', 'of200', 'Oil filter',          1299, 40, 0.30),
  ('AF-310', 'af310', 'Air filter',          2450,  0, 0.45)
ON CONFLICT (search_number) DO NOTHING;

INSERT INTO part_compatibility (part_id, model_id)
SELECT p.id, m.id
FROM (VALUES
  ('bp123', 'Corolla'), ('bp123', 'Camry'),
  ('of200', 'Corolla'), ('of200', 'Camry'), ('of200', 'Civic'),
  ('af310', 'Corolla')
) AS v(search_number, model)
JOIN parts  p ON p.search_number = v.search_number
JOIN models m ON m.name = v.model
ON CONFLICT DO NOTHING;