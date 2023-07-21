import { IsMongoId, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateRetiroDto {

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
