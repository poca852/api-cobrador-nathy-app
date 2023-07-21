import { IsMongoId, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateInversionDto {
   
   @IsString()
   fecha: string; 

   @IsNumber()
   valor: number; 

   @IsString()
   @IsOptional()
   nota: string; 
   
   @IsMongoId()
   ruta: string; 

}
