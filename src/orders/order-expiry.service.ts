import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../database/database.service.js';

const FIRST_RUN_MS = 30_000;
const EVERY_MS = 10 * 60_000;

@Injectable()
export class OrderExpiryService implements OnModuleInit, OnModuleDestroy {
  private readonly log = new Logger(OrderExpiryService.name);
  private readonly hours: number;
  private first?: NodeJS.Timeout;
  private repeat?: NodeJS.Timeout;
  private running = false;

  constructor(private readonly db: DatabaseService, config: ConfigService) {
    const raw = Number(config.get('ORDER_EXPIRY_HOURS') ?? 48);
    this.hours = Number.isFinite(raw) && raw >= 0 ? raw : 48;
  }

  onModuleInit() {
    this.log.log(`Unpaid orders expire after ${this.hours} hours`);
    this.first = setTimeout(() => void this.run(), FIRST_RUN_MS);
    this.repeat = setInterval(() => void this.run(), EVERY_MS);
    this.first.unref();
    this.repeat.unref();
  }

  onModuleDestroy() {
    clearTimeout(this.first);
    clearInterval(this.repeat);
  }

  async run() {
    if (this.running) return;
    this.running = true;
    try {
      const due = await this.db.query(
        `SELECT id FROM orders
         WHERE status = 'awaiting_payment'
           AND created_at < now() - ($1::float8 * interval '1 hour')
         ORDER BY id LIMIT 50`,
        [this.hours],
      );
      for (const row of due.rows) {
        if (await this.expire(row.id)) {
          this.log.log(`Expired unpaid order ${row.id}`);
        }
      }
    } catch (err) {
      this.log.error('Expiry run failed', err instanceof Error ? err.stack : String(err));
    } finally {
      this.running = false;
    }
  }

  private expire(id: number) {
    return this.db.transaction(async (client) => {
      const order = await client.query(
        'SELECT status FROM orders WHERE id = $1 FOR UPDATE',
        [id],
      );
      // Paid or cancelled in the meantime? Leave it alone.
      if (order.rows[0]?.status !== 'awaiting_payment') return false;

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
      await client.query(`UPDATE orders SET status = 'cancelled' WHERE id = $1`, [id]);
      await client.query(`UPDATE invoices SET status = 'cancelled' WHERE order_id = $1`, [id]);
      return true;
    });
  }
}