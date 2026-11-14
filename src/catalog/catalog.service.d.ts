import { DatabaseService } from '../src/database/database.service.js';
export declare class CatalogService {
    private readonly db;
    constructor(db: DatabaseService);
    brands(): Promise<any[]>;
}
