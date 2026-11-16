import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import pg from 'pg';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
       private pool: pg.Pool;
       constructor(config: ConfigService) {
        this.pool = new pg.Pool({
          connectionString: config.getOrThrow<string>('DATABASE_URL'),
          max: 10,
          statement_timeout: 5000,
          idleTimeoutMillis: 30_000,
        });
}
query( text: string, params ?: unknown[] ) {
   return this.pool.query(text, params);
}

async transaction<T>(fn: (client: pg.PoolClient) => Promise<T>): Promise<T> {
   const client = await this.pool.connect();
   try {
     await client.query('BEGIN');
     const result = await fn(client);
     await client.query('COMMIT');
     return result;
   } catch (err) {
     await client.query('ROLLBACK');
     throw err;
   } finally {
     client.release();
   }
 }

async onModuleDestroy() {
   await this.pool.end()
}
}