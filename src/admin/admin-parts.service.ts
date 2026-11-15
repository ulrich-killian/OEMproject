import {
  BadRequestException, ConflictException, Injectable, NotFoundException,
} from '@nestjs/common';
import { MemoryCacheService } from '../cache/memory-cache.service.js';
import { DatabaseService } from '../database/database.service.js';
import { CreatePartDto, UpdatePartDto } from './admin-parts.dto.js';

const COLUMNS = 'id, oem_number, search_number, name, price_cents, stock, weight_kg';
const pgCode = (err: unknown) => (err as { code?: string }).code;

@Injectable()
export class AdminPartsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly cache: MemoryCacheService,
  ) {}

  async create(dto: CreatePartDto) {
    const searchNumber = dto.oem_number.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!searchNumber) {
      throw new BadRequestException('oem_number must contain letters or digits');
    }
    try {
      const result = await this.db.query(
        `INSERT INTO parts (oem_number, search_number, name, price_cents, stock, weight_kg)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING ${COLUMNS}`,
        [dto.oem_number.trim(), searchNumber, dto.name.trim(), dto.price_cents, dto.stock, dto.weight_kg ?? null],
      );
      this.cache.clearPrefix('parts:');
      return result.rows[0];
    } catch (err) {
      if (pgCode(err) === '23505') {
        throw new ConflictException('A part with this OEM number already exists');
      }
      throw err;
    }
  }

  async update(id: number, dto: UpdatePartDto) {
    const fields: [string, unknown][] = [];
    if (dto.name !== undefined) fields.push(['name', dto.name.trim()]);
    if (dto.price_cents !== undefined) fields.push(['price_cents', dto.price_cents]);
    if (dto.stock !== undefined) fields.push(['stock', dto.stock]);
    if (dto.weight_kg !== undefined) fields.push(['weight_kg', dto.weight_kg]);
    if (fields.length === 0) throw new BadRequestException('Nothing to update');

    const sets = fields.map(([col], i) => `${col} = $${i + 1}`).join(', ');
    const params = [...fields.map(([, value]) => value), id];
    const result = await this.db.query(
      `UPDATE parts SET ${sets} WHERE id = $${params.length} RETURNING ${COLUMNS}`,
      params,
    );
    if (result.rows.length === 0) throw new NotFoundException('Part not found');
    this.cache.clearPrefix('parts:');
    return result.rows[0];
  }

  async setFits(id: number, modelIds: number[]) {
    const result = await this.db.transaction(async (client) => {
      const part = await client.query('SELECT id FROM parts WHERE id = $1 FOR UPDATE', [id]);
      if (part.rows.length === 0) throw new NotFoundException('Part not found');

      await client.query('DELETE FROM part_compatibility WHERE part_id = $1', [id]);
      try {
        await client.query(
          `INSERT INTO part_compatibility (part_id, model_id)
           SELECT $1::int, m FROM unnest($2::int[]) AS m
           ON CONFLICT DO NOTHING`,
          [id, modelIds],
        );
      } catch (err) {
        if (pgCode(err) === '23503') {
          throw new BadRequestException('One or more models do not exist');
        }
        throw err;
      }
      return { part_id: id, model_ids: [...new Set(modelIds)] };
    });
    this.cache.clearPrefix('parts:');
    return result;
  }
}