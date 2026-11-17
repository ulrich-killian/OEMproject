import { Controller, Get, Param, ParseIntPipe, Patch, Query, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../auth/admin.guard.js';
import { ListEmailsQuery } from './admin-emails.dto.js';
import { AdminEmailsService } from './admin-emails.service.js';

@Controller('admin/emails')
@UseGuards(AdminGuard)
export class AdminEmailsController {
  constructor(private readonly emails: AdminEmailsService) {}

  @Get()
  list(@Query() query: ListEmailsQuery) {
    return this.emails.list(query);
  }

  @Patch(':id/sent')
  markSent(@Param('id', ParseIntPipe) id: number) {
    return this.emails.markSent(id);
  }
}