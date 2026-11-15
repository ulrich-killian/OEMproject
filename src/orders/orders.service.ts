import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { DatabaseService } from '../database/database.service.js';
import { CreateOrderDto } from './create-order.dto.js';

@Injectable()
export class OrdersService {
  constructor(private readonly db: DatabaseService) {}

  create(dto: CreateOrderDto) {
    // Merge duplicates: two lines for the same part become one total quantity
    const wanted = new Map<number, number>();
    for (const item of dto.items) {
      wanted.set(item.part_id, (wanted.get(item.part_id) ?? 0) + item.qty);
    }
    const ids = [...wanted.keys()];

    return this.db.transaction(async (client) => {
      // Lock these part rows until the transaction ends (sorted by id to avoid deadlocks)
      const found = await client.query(
        `SELECT id, oem_number, name, price_cents, stock, weight_kg
         FROM parts WHERE id = ANY($1::int[]) ORDER BY id FOR UPDATE`,
        [ids],
      );
      if (found.rows.length !== ids.length) {
        throw new BadRequestException('One or more parts do not exist');
      }

      let subtotal = 0;
      for (const p of found.rows) {
        const qty = wanted.get(p.id)!;
        if (p.stock < qty) {
          throw new ConflictException(`Not enough stock for ${p.oem_number}`);
        }
        subtotal += p.price_cents * qty;
      }

      const token = randomBytes(24).toString('base64url');
      const order = await client.query(
        `INSERT INTO orders
           (public_token, subtotal_cents, shipping_cents, total_cents,
            buyer_name, buyer_email, buyer_phone,
            ship_line1, ship_line2, ship_city, ship_region, ship_postal_code, ship_country)
         VALUES ($1, $2, 0, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING id`,
        [
          token, subtotal, dto.buyer_name, dto.buyer_email, dto.buyer_phone,
          dto.ship_line1, dto.ship_line2 ?? null, dto.ship_city,
          dto.ship_region ?? null, dto.ship_postal_code ?? null, dto.ship_country,
        ],
      );
      const orderId = order.rows[0].id;

      for (const p of found.rows) {
        const qty = wanted.get(p.id)!;
        await client.query(
          `INSERT INTO order_items
             (order_id, part_id, oem_number, name, qty, unit_price_cents, weight_kg)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [orderId, p.id, p.oem_number, p.name, qty, p.price_cents, p.weight_kg],
        );
        await client.query('UPDATE parts SET stock = stock - $1 WHERE id = $2', [qty, p.id]);
      }

      const counter = await client.query(
        `UPDATE counters SET value = value + 1 WHERE name = 'invoice' RETURNING value`,
      );
      const invoiceNumber =
        `INV-${new Date().getFullYear()}-${String(counter.rows[0].value).padStart(6, '0')}`;
      await client.query(
        'INSERT INTO invoices (order_id, invoice_number) VALUES ($1, $2)',
        [orderId, invoiceNumber],
      );

      const lines = found.rows.map(
        (p) => `${wanted.get(p.id)} x ${p.oem_number} ${p.name} - $${(p.price_cents / 100).toFixed(2)} each`,
      );
      const body = [
        'Thank you for your order.',
        `Invoice: ${invoiceNumber}`,
        '',
        ...lines,
        '',
        `Total: $${(subtotal / 100).toFixed(2)} USD`,
        `Order tracking code: ${token}`,
      ].join('\n');
      await client.query(
        'INSERT INTO emails (order_id, to_email, subject, body) VALUES ($1, $2, $3, $4)',
        [orderId, dto.buyer_email, `Your invoice ${invoiceNumber}`, body],
      );

      return {
        order_token: token,
        invoice_number: invoiceNumber,
        total_cents: subtotal,
        status: 'awaiting_payment',
      };
    });
  }
}