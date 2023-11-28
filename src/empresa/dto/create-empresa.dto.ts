import { IsArray, IsBoolean, IsMongoId, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreateEmpresaDto {

   @IsString()
   name: string;

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