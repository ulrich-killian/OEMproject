import { CatalogService } from './catalog.service.js';
export declare class CatalogController {
    private readonly catalog;
    constructor(catalog: CatalogService);
    brands(): Promise<any[]>;
}
