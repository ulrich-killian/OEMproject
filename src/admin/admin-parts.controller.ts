import {
   Body, Controller, Param, ParseIntPipe, Patch, Post, Put, UseGuards,
 } from '@nestjs/common';
 import { AdminGuard } from '../auth/admin.guard.js';
 import { CreatePartDto, SetFitsDto, UpdatePartDto } from './admin-parts.dto.js';
 import { AdminPartsService } from './admin-parts.service.js';
 
 @Controller('admin/parts')
 @UseGuards(AdminGuard)
 export class AdminPartsController {
   constructor(private readonly parts: AdminPartsService) {}
 
   @Post()
   create(@Body() dto: CreatePartDto) {
     return this.parts.create(dto);
   }
 
   @Patch(':id')
   update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePartDto) {
     return this.parts.update(id, dto);
   }
 
   @Put(':id/fits')
   setFits(@Param('id', ParseIntPipe) id: number, @Body() dto: SetFitsDto) {
     return this.parts.setFits(id, dto.model_ids);
   }
 }