import { IsString, MinLength, IsMongoId, IsOptional, IsArray } from "class-validator";

export class CreateUserDto {

   @IsString()
   @MinLength(3)
   username: string;

   @IsString()
   @MinLength(3)
   nombre: string;

   @IsString()
   @MinLength(4)
   password: string;

   @IsMongoId()
   rol: string;

   @IsMongoId({
      each: true
   })
   @IsArray()
   @IsOptional()
   rutas?: string;

   @IsMongoId()
   @IsOptional()
   ruta?: string;

   @IsMongoId()
   @IsOptional()
   empresa?: string;
}