import { IsMongoId, IsNumber, IsString } from "class-validator";

export class CreatePagoDto {

   @IsString()
   fecha: string; 

   @IsNumber()
   valor: number; 

   @IsMongoId()
   ruta: string; 

   @IsMongoId()
   credito: string; 

   @IsMongoId()
   cliente: string;
   
}
