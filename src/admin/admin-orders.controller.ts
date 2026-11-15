import {
   Body, Controller, Get, Param, ParseIntPipe, Patch, Query, UseGuards,
 } from '@nestjs/common';
 import { AdminGuard } from '../auth/admin.guard.js';
 import { ListOrdersQuery, UpdateStatusDto } from './admin-orders.dto.js';
 import { AdminOrdersService } from './admin-orders.service.js';
 
 @Controller('admin/orders')
 @UseGuards(AdminGuard)
 export class AdminOrdersController {
   constructor(private readonly orders: AdminOrdersService) {}
 
   @Get()
   list(@Query() query: ListOrdersQuery) {
     return this.orders.list(query);
   }
 
   @Get(':id')
   get(@Param('id', ParseIntPipe) id: number) {
     return this.orders.get(id);
   }
 
   @Patch(':id/status')
   setStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStatusDto) {
     return this.orders.setStatus(id, dto.status);
   }
 }