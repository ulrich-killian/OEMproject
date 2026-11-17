import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { DatabaseModule } from '../database/database.module.js';
import { AdminOrdersController } from './admin-orders.controller.js';
import { AdminOrdersService } from './admin-orders.service.js';
import { AdminPartsController } from './admin-parts.controller.js';
import { AdminPartsService } from './admin-parts.service.js';
import { AdminEmailsController } from './admin-emails.controller.js';
import { AdminEmailsService } from './admin-emails.service.js';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [AdminPartsController, AdminOrdersController, AdminEmailsController],
  providers: [AdminPartsService, AdminOrdersService, AdminEmailsService],
})
export class AdminModule {}