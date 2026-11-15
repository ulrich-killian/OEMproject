import { randomBytes, scrypt as scryptCb } from 'node:crypto';
import readline from 'node:readline/promises';
import { promisify } from 'node:util';
import pg from 'pg';

const scrypt = promisify(scryptCb);

async function hashPassword(password) {
  const salt = randomBytes(16);
  const key = await scrypt(password, salt, 64);
  return `${salt.toString('base64')}:${key.toString('base64')}`;
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const email = (await rl.question('Admin email: ')).trim().toLowerCase();
const password = await rl.question('Password (12+ characters, visible): ');
rl.close();

if (!email.includes('@')) throw new Error('That does not look like an email');
if (password.length < 12) throw new Error('Password must be at least 12 characters');

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
try {
  await client.query(
    'INSERT INTO admin_users (email, password_hash) VALUES ($1, $2)',
    [email, await hashPassword(password)],
  );
  console.log('Admin created:', email);
} finally {
  await client.end();
}