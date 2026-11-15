import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module.js';
import { AdminGuard } from './admin.guard.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';

@Module({
  imports: [DatabaseModule],
  controllers: [AuthController],
  providers: [AuthService, AdminGuard],
  exports: [AuthService, AdminGuard],
})
export class AuthModule {}