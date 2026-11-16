import {
  BadRequestException, Controller, Get, NotFoundException, Param, ParseIntPipe, Query,
} from '@nestjs/common';
import { PartsService } from './parts.service.js';

@Controller('parts')
export class PartsController {
  constructor(private readonly parts: PartsService) {}

  @Get()
  search(
    @Query('q') q?: string,
    @Query('model_id') modelId?: string,
    @Query('ids') idsText?: string | string[],
  ) {
    const id = modelId === undefined ? undefined : Number(modelId);
    if (id !== undefined && !Number.isInteger(id)) {
      throw new BadRequestException('model_id must be a whole number');
    }
  
    let ids: number[] | undefined;
    if (idsText !== undefined) {
      const raw = Array.isArray(idsText) ? idsText.join(',') : idsText;
      ids = raw.split(',').map(Number);
      if (
        ids.length > 50 ||
        ids.some((n) => !Number.isInteger(n) || n < 1 || n > 2_147_483_647)
      ) {
        throw new BadRequestException('ids must be up to 50 whole numbers separated by commas');
      }
    }
    return this.parts.search(q, id, ids);
  }
  @Get(':id')
detail(@Param('id', ParseIntPipe) id: number) {
  if (id < 1 || id > 2_147_483_647) throw new NotFoundException('Part not found');
  return this.parts.detail(id);
}
}