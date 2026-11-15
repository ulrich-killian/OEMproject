import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize, ArrayMinSize, IsArray, IsEmail, IsInt, IsISO31661Alpha2,
  IsOptional, IsString, Length, Max, Min, ValidateNested,
} from 'class-validator';

class OrderItemDto {
  @IsInt() @Min(1) part_id!: number;
  @IsInt() @Min(1) @Max(100) qty!: number;
}

export class CreateOrderDto {
  @IsString() @Length(1, 100) buyer_name!: string;
  @IsEmail() buyer_email!: string;
  @IsString() @Length(5, 30) buyer_phone!: string;
  @IsString() @Length(1, 200) ship_line1!: string;
  @IsOptional() @IsString() @Length(1, 200) ship_line2?: string;
  @IsString() @Length(1, 100) ship_city!: string;
  @IsOptional() @IsString() @Length(1, 100) ship_region?: string;
  @IsOptional() @IsString() @Length(1, 20) ship_postal_code?: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.toUpperCase() : value))
  @IsISO31661Alpha2()
  ship_country!: string;

  @IsArray() @ArrayMinSize(1) @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];
}