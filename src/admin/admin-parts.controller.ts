import {
  Body, Controller, Get, NotFoundException, Param, ParseIntPipe, Patch, Post, Put, Query, UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../auth/admin.guard.js';
import { CreatePartDto, ListPartsQuery, SetFitsDto, UpdatePartDto } from './admin-parts.dto.js';
import { AdminPartsService } from './admin-parts.service.js';

const MAX_ID = 2_147_483_647;
const checkId = (id: number) => {
  if (id < 1 || id > MAX_ID) throw new NotFoundException('Part not found');
};

@Controller('admin/parts')
@UseGuards(AdminGuard)
export class AdminPartsController {
  constructor(private readonly parts: AdminPartsService) {}

  @Get()
  list(@Query() query: ListPartsQuery) {
    return this.parts.list(query.q, query.limit ?? 20, query.offset ?? 0);
  }

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number) {
    checkId(id);
    return this.parts.get(id);
  }

  @Post()
  create(@Body() dto: CreatePartDto) {
    return this.parts.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePartDto) {
    checkId(id);
    return this.parts.update(id, dto);
  }

  @Put(':id/fits')
  setFits(@Param('id', ParseIntPipe) id: number, @Body() dto: SetFitsDto) {
    checkId(id);
    return this.parts.setFits(id, dto.model_ids);
  }
}