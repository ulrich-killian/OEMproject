import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module.js';
import { PartsController } from './parts.controller.js';
import { PartsService } from './parts.service.js';

@Module({
  imports: [DatabaseModule],
  controllers: [PartsController],
  providers: [PartsService],
})
export class PartsModule {}