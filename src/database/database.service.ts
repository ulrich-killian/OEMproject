import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import pg from 'pg';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
       private pool: pg.Pool;
       constructor(config: ConfigService) {
         this.pool = new pg.Pool ({
            connectionString: config.getOrThrow<string>('DATABASE_URL'),
         })
}
query( text: string, params ?: unknown[] ) {
   return this.pool.query(text, params);
}

async onModuleDestroy() {
   await this.pool.end()
}
}