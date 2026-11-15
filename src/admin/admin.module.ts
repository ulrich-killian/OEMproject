import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { DatabaseModule } from '../database/database.module.js';
import { AdminOrdersController } from './admin-orders.controller.js';
import { AdminOrdersService } from './admin-orders.service.js';
import { AdminPartsController } from './admin-parts.controller.js';
import { AdminPartsService } from './admin-parts.service.js';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [AdminPartsController, AdminOrdersController],
  providers: [AdminPartsService, AdminOrdersService],
})
export class AdminModule {}