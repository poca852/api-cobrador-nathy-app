import { IsBoolean, IsEnum, IsIn, IsMongoId, IsOptional, IsString, Validate } from "class-validator";

export class GlobalParams {

   @IsMongoId()
   @IsOptional()
   ruta?: string;

   @IsMongoId()
   @IsOptional()
   userId?: string;

   @IsString()
   @IsOptional()
   fecha?: string;

   @IsString()
   @IsOptional()
   @IsEnum(["false", "true"])
   status?: string;

}