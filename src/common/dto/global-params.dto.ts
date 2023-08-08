import { Type } from "class-transformer";
import { IsBoolean, IsEnum, IsIn, IsMongoId, IsOptional, IsString, Validate } from "class-validator";

export class GlobalParams {

   @IsMongoId()
   @IsOptional()
   ruta?: string;

   @IsMongoId()
   @IsOptional()
   caja?: string;

   @IsMongoId()
   @IsOptional()
   userId?: string;

   @IsString()
   @IsOptional()
   fecha?: string;

   @Type(() => Number)
   @IsOptional()
   fechaInicio?: number;

   @Type(() => Number)
   @IsOptional()
   fechaFin?: number;

   @IsString()
   @IsOptional()
   @IsEnum(["false", "true"])
   status?: string;

}