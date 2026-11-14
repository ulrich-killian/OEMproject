import fs from 'node:fs/promises';
import pg from 'pg';

const dirUrl = new URL('../migrations/', import.meta.url);
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

try {
  await client.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
    name text PRIMARY KEY,
    applied_at timestamptz NOT NULL DEFAULT now()
  )`);

  const done = new Set(
    (await client.query('SELECT name FROM schema_migrations')).rows.map((r) => r.name),
  );
  const files = (await fs.readdir(dirUrl)).filter((f) => f.endsWith('.sql')).sort();

  let count = 0;
  for (const file of files) {
    if (done.has(file)) continue;
    const sql = await fs.readFile(new URL(file, dirUrl), 'utf8');
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file]);
      await client.query('COMMIT');
      console.log('applied', file);
      count++;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    }
  }
  if (count === 0) console.log('nothing to do');
} finally {
  await client.end();
}