import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

export const ORDER_STATUSES = [
  'awaiting_payment', 'paid', 'packed', 'shipped', 'delivered', 'cancelled',
] as const;

export class ListOrdersQuery {
  @IsOptional() @IsIn(ORDER_STATUSES) status?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) offset?: number;
}

export class UpdateStatusDto {
  @IsIn(ORDER_STATUSES) status!: string;
}