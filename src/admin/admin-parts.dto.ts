import {
   ArrayMaxSize, IsArray, IsInt, IsNumber, IsOptional, IsString, Length, Max, Min,
 } from 'class-validator';
 import { Type } from 'class-transformer';

 export class CreatePartDto {
   @IsString() @Length(1, 60) oem_number!: string;
   @IsString() @Length(1, 200) name!: string;
   @IsInt() @Min(0) @Max(100000000) price_cents!: number;
   @IsInt() @Min(0) @Max(1000000) stock!: number;
   @IsOptional() @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) @Max(100000) weight_kg?: number;
 }
 
 export class UpdatePartDto {
   @IsOptional() @IsString() @Length(1, 200) name?: string;
   @IsOptional() @IsInt() @Min(0) @Max(100000000) price_cents?: number;
   @IsOptional() @IsInt() @Min(0) @Max(1000000) stock?: number;
   @IsOptional() @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) @Max(100000) weight_kg?: number;
 }
 
 export class SetFitsDto {
   @IsArray() @ArrayMaxSize(500) @IsInt({ each: true }) @Min(1, { each: true })
   model_ids!: number[];
 }

 export class ListPartsQuery {
  @IsOptional() @IsString() @Length(1, 60) q?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) offset?: number;
}