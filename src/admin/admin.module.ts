import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js'
import { DatabaseModule } from '../database/database.module.js';
import { AdminPartsController } from './admin-parts.controller.js';
import { AdminPartsService } from './admin-parts.service.js';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [AdminPartsController],
  providers: [AdminPartsService],
})
export class AdminModule {}