import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';

@Injectable()
export class CatalogService {
  constructor(private readonly db: DatabaseService) {}

  async brands() {
    const result = await this.db.query(
      'SELECT id, name FROM brands ORDER BY name',
    );
    return result.rows;
  }

  async models(brandId: number) {
    const result = await this.db.query(
      `SELECT id, name, year_from, year_to
       FROM models
       WHERE brand_id = $1
       ORDER BY name, year_from`,
      [brandId],
    );
    return result.rows;
  }
}

