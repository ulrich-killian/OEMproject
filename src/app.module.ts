import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ConfigModule } from '@nestjs/config';
import  { DatabaseModule } from './database/database.module.js'
import { PartsModule } from './parts/parts.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), DatabaseModule, PartsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
