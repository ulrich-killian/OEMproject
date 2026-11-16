import { Injectable, NotFoundException } from '@nestjs/common';
import { MemoryCacheService } from '../cache/memory-cache.service.js';
import { DatabaseService } from '../database/database.service.js';

@Injectable()
export class PartsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly cache: MemoryCacheService,
  ) {}

  search(q?: string, modelId?: number, ids?: number[]) {
    const normalized = (q ?? '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 60);
    const key = `parts:${q ? `q=${normalized}` : 'all'}:${modelId ?? 'any'}:${ids ? ids.join(',') : 'any'}`;

    return this.cache.remember(key, 30_000, async () => {
      const where: string[] = [];
      const params: unknown[] = [];

      if (q) {
        params.push(normalized);
        where.push(`search_number = $${params.length}`);
      }
      if (modelId !== undefined) {
        params.push(modelId);
        where.push(
          `id IN (SELECT part_id FROM part_compatibility WHERE model_id = $${params.length})`,
        );
      }

      if (ids !== undefined) {
        params.push(ids);
        where.push(`id = ANY($${params.length}::int[])`);
      }

      const sql = `
        SELECT id, oem_number, name, price_cents, stock, weight_kg
        FROM parts
        ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
        ORDER BY name
        LIMIT 50`;

      const result = await this.db.query(sql, params);
      return result.rows;
    });
  }
  detail(id: number) {
    return this.cache.remember(`parts:detail:${id}`, 30_000, async () => {
      const part = await this.db.query(
        `SELECT id, oem_number, name, price_cents, stock, weight_kg
         FROM parts WHERE id = $1`,
        [id],
      );
      if (part.rows.length === 0) throw new NotFoundException('Part not found');
  
      const fits = await this.db.query(
        `SELECT m.id, b.name AS brand, m.name, m.year_from, m.year_to
         FROM part_compatibility c
         JOIN models m ON m.id = c.model_id
         JOIN brands b ON b.id = m.brand_id
         WHERE c.part_id = $1
         ORDER BY b.name, m.name, m.year_from`,
        [id],
      );
      return { ...part.rows[0], fits: fits.rows };
    });
  }
}