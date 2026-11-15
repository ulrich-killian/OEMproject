import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import { ListOrdersQuery } from './admin-orders.dto.js';

const NEXT: Record<string, string[]> = {
  awaiting_payment: ['paid', 'cancelled'],
  paid: ['packed', 'cancelled'],
  packed: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};

@Injectable()
export class AdminOrdersService {
  constructor(private readonly db: DatabaseService) {}

  async list(q: ListOrdersQuery) {
    const params: unknown[] = [];
    let where = '';
    if (q.status) {
      params.push(q.status);
      where = `WHERE o.status = $${params.length}`;
    }
    params.push(q.limit ?? 20);
    params.push(q.offset ?? 0);

    const result = await this.db.query(
      `SELECT o.id, i.invoice_number, o.status, o.buyer_name, o.buyer_email,
              o.currency, o.total_cents, o.created_at
       FROM orders o JOIN invoices i ON i.order_id = o.id
       ${where}
       ORDER BY o.created_at DESC, o.id DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params,
    );
    return result.rows;
  }

  async get(id: number) {
    const order = await this.db.query(
      `SELECT o.*, i.invoice_number, i.status AS invoice_status, i.issued_at, i.paid_at
       FROM orders o JOIN invoices i ON i.order_id = o.id
       WHERE o.id = $1`,
      [id],
    );
    if (order.rows.length === 0) throw new NotFoundException('Order not found');

    const items = await this.db.query(
      `SELECT part_id, oem_number, name, qty, unit_price_cents, weight_kg
       FROM order_items WHERE order_id = $1 ORDER BY id`,
      [id],
    );
    return { ...order.rows[0], items: items.rows };
  }

  setStatus(id: number, status: string) {
    return this.db.transaction(async (client) => {
      const current = await client.query(
        'SELECT status FROM orders WHERE id = $1 FOR UPDATE',
        [id],
      );
      if (current.rows.length === 0) throw new NotFoundException('Order not found');

      const from: string = current.rows[0].status;
      if (!(NEXT[from] ?? []).includes(status)) {
        throw new ConflictException(`Cannot change an order from ${from} to ${status}`);
      }

      await client.query('UPDATE orders SET status = $1 WHERE id = $2', [status, id]);

      if (status === 'paid') {
        await client.query(
          `UPDATE invoices SET status = 'paid', paid_at = now() WHERE order_id = $1`,
          [id],
        );
      }

      if (status === 'cancelled') {
        // Lock the parts in id order first, the same order new orders use (avoids deadlocks)
        await client.query(
          `SELECT id FROM parts
           WHERE id IN (SELECT part_id FROM order_items WHERE order_id = $1)
           ORDER BY id FOR UPDATE`,
          [id],
        );
        await client.query(
          `UPDATE parts p SET stock = p.stock + oi.qty
           FROM order_items oi
           WHERE oi.order_id = $1 AND oi.part_id = p.id`,
          [id],
        );
        await client.query(
          `UPDATE invoices SET status = 'cancelled' WHERE order_id = $1`,
          [id],
        );
      }

      return { id, from, status };
    });
  }
}