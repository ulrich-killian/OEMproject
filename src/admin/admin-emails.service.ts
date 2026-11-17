import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import { ListEmailsQuery } from './admin-emails.dto.js';

@Injectable()
export class AdminEmailsService {
  constructor(private readonly db: DatabaseService) {}

  async list(q: ListEmailsQuery) {
    const params: unknown[] = [];
    let where = '';
    if (q.status) {
      params.push(q.status);
      where = `WHERE status = $${params.length}`;
    }
    params.push(q.limit ?? 20);
    params.push(q.offset ?? 0);

    const result = await this.db.query(
      `SELECT id, order_id, to_email, subject, body, status, attempts, created_at, sent_at
       FROM emails
       ${where}
       ORDER BY created_at DESC, id DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params,
    );
    return result.rows;
  }

  async markSent(id: number) {
    const result = await this.db.query(
      `UPDATE emails
       SET status = 'sent', sent_at = now(), attempts = attempts + 1
       WHERE id = $1 AND status <> 'sent'
       RETURNING id, status, sent_at`,
      [id],
    );
    if (result.rows.length === 0) {
      const exists = await this.db.query('SELECT 1 FROM emails WHERE id = $1', [id]);
      if (exists.rows.length === 0) throw new NotFoundException('Email not found');
      throw new ConflictException('Already marked as sent');
    }
    return result.rows[0];
  }
}