import { Body, Controller, Post, Get, Param } from '@nestjs/common';
import { CreateOrderDto } from './create-order.dto.js';
import { OrdersService } from './orders.service.js';
import { Throttle } from '@nestjs/throttler';

@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Post()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  create(@Body() dto: CreateOrderDto) {
    return this.orders.create(dto);
  }
  @Get(':token')
track(@Param('token') token: string) {
  return this.orders.track(token);
}
}