import { Injectable } from '@nestjs/common';
import { MemoryCacheService } from '../cache/memory-cache.service.js';
import { DatabaseService } from '../database/database.service.js';

@Injectable()
export class PartsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly cache: MemoryCacheService,
  ) {}

  search(q?: string, modelId?: number) {
    const normalized = (q ?? '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 60);
    const key = `parts:${q ? `q=${normalized}` : 'all'}:${modelId ?? 'any'}`;

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
}