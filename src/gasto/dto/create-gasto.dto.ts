import { IsMongoId, IsNumber, IsOptional, IsString, Validate } from "class-validator";
import { IsDateStringConstraint } from "../helpers/isDate";

export class CreateGastoDto {

   @IsMongoId()
   gasto: string;

   @Validate(IsDateStringConstraint)
   @IsOptional()
   fecha?: string; 
   
   @IsNumber()
   valor: number; 

   @IsString()
   @IsOptional()
   nota?: string; 

   @IsMongoId()
   ruta: string; 
   
}
