import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createHash, randomBytes } from 'node:crypto';
import { DatabaseService } from '../database/database.service.js';
import { hashPassword, verifyPassword } from './password.js';

const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');

@Injectable()
export class AuthService {
  constructor(private readonly db: DatabaseService) {}

  async login(email: string, password: string) {
    const found = await this.db.query(
      'SELECT id, password_hash FROM admin_users WHERE email = $1',
      [email.toLowerCase()],
    );
    const admin = found.rows[0];

    if (!admin) {
      await hashPassword(password); // spend the same time as a real check
      throw new UnauthorizedException('Invalid email or password');
    }
    if (!(await verifyPassword(password, admin.password_hash))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = randomBytes(32).toString('base64url');
    const session = await this.db.query(
      `INSERT INTO admin_sessions (token_hash, admin_id, expires_at)
       VALUES ($1, $2, now() + interval '12 hours') RETURNING expires_at`,
      [sha256(token), admin.id],
    );
    return { token, expires_at: session.rows[0].expires_at };
  }

  async adminFromToken(token: string) {
    const result = await this.db.query(
      `SELECT a.id, a.email
       FROM admin_sessions s JOIN admin_users a ON a.id = s.admin_id
       WHERE s.token_hash = $1 AND s.expires_at > now()`,
      [sha256(token)],
    );
    return result.rows[0] ?? null;
  }
}