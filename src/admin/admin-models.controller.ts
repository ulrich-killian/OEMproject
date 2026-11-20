import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../auth/admin.guard.js';
import { AdminPartsService } from './admin-parts.service.js';

@Controller('admin/models')
@UseGuards(AdminGuard)
export class AdminModelsController {
  constructor(private readonly parts: AdminPartsService) {}

  @Get()
  list() {
    return this.parts.models();
  }
}