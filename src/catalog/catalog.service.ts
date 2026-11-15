import { Injectable } from '@nestjs/common';
import { MemoryCacheService } from '../cache/memory-cache.service.js';
import { DatabaseService } from '../database/database.service.js';

const TEN_MINUTES = 10 * 60_000;

@Injectable()
export class CatalogService {
  constructor(
    private readonly db: DatabaseService,
    private readonly cache: MemoryCacheService,
  ) {}

  brands() {
    return this.cache.remember('catalog:brands', TEN_MINUTES, async () => {
      const result = await this.db.query('SELECT id, name FROM brands ORDER BY name');
      return result.rows;
    });
  }

  models(brandId: number) {
    return this.cache.remember(`catalog:models:${brandId}`, TEN_MINUTES, async () => {
      const result = await this.db.query(
        `SELECT id, name, year_from, year_to
         FROM models
         WHERE brand_id = $1
         ORDER BY name, year_from`,
        [brandId],
      );
      return result.rows;
    });
  }
}