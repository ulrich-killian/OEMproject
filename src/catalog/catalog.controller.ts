import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { CatalogService } from './catalog.service.js';

@Controller()
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get('brands')
  brands() {
    return this.catalog.brands();
  }

  @Get('models')
models(@Query('brand_id') brandId?: string) {
  const id = Number(brandId);
  if (brandId === undefined || !Number.isInteger(id)) {
    throw new BadRequestException('brand_id is required and must be a whole number');
  }
  return this.catalog.models(id);
}
}