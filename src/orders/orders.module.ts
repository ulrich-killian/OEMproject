import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module.js';
import { OrdersController } from './orders.controller.js';
import { OrderExpiryService } from './order-expiry.service.js';
import { OrdersService } from './orders.service.js';

@Module({
  imports: [DatabaseModule],
  controllers: [OrdersController],
  providers: [OrdersService, OrderExpiryService],
})
export class OrdersModule {}