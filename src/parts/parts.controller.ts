import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { PartsService } from './parts.service.js';

@Controller('parts')
export class PartsController {
  constructor(private readonly parts: PartsService) {}

  @Get()
  search(@Query('q') q?: string, @Query('model_id') modelId?: string) {
    const id = modelId === undefined ? undefined : Number(modelId);
    if (id !== undefined && !Number.isInteger(id)) {
      throw new BadRequestException('model_id must be a whole number');
    }
    return this.parts.search(q, id);
  }
}