import { IsArray, IsEmail, IsMongoId, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateEmpresaDto {

   @IsString()
   name: string;

   @IsEmail()
   @IsOptional()
   email?: string;

   @IsNumber()
   @IsOptional()
   dayOfPay?: number;

   @IsString()
   country: string;

   @IsMongoId()
   @IsOptional()
   owner: string;

   @IsMongoId({
      each: true
   })
   @IsArray()
   @IsOptional()
   employes: string[]

   @IsMongoId({
      each: true
   })
   @IsArray()
   @IsOptional()
   rutas: string[]

}