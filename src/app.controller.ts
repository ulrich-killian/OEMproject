import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';
import { DatabaseService } from './database/database.service.js';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly db: DatabaseService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('db-test')
  async dbTest() {
    const result = await this.db.query('SELECT now() AS time');
    return result.rows[0];
  }
}