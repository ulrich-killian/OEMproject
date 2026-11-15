import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module.js';
import { PartsModule } from './parts/parts.module.js';
import { CatalogModule } from './catalog/catalog.module.js';
import { OrdersModule } from './orders/orders.module.js';
import { AdminGuard } from './auth/admin.guard.js';
import { AuthController } from './auth/auth.controller.js'
import { AuthService } from './auth/auth.service.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    PartsModule,
    CatalogModule,
    OrdersModule,
  ],
  controllers: [AppController, AuthController],
  providers: [AppService, AuthService, AdminGuard],
  exports: [AuthService, AdminGuard],
})
export class AppModule {}
