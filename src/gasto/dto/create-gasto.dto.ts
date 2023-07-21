import { IsMongoId, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateGastoDto {

   @IsMongoId()
   gasto: string;

   @IsString()
   fecha: string; 
   
   @IsNumber()
   valor: number; 

   @IsString()
   @IsOptional()
   nota?: string; 

   @IsMongoId()
   ruta: string; 
   
}
