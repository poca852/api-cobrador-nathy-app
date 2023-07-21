import { IsMongoId, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateCajaDto {
   
   @IsString()
   fecha: string;

   @IsNumber()
   @IsOptional()
   base?: number = 0;

   @IsNumber()
   @IsOptional()
   inversion?: number = 0;

   @IsNumber()
   @IsOptional()
   retiro?: number = 0;

   @IsNumber()
   @IsOptional()
   gasto?: number = 0;

   @IsNumber()
   @IsOptional()
   cobro?: number = 0; 
   
   @IsNumber()
   @IsOptional()
   prestamo?: number = 0;

   @IsNumber()
   @IsOptional()
   total_clientes?: number = 0;
   
   @IsNumber()
   @IsOptional()
   clientes_pendientes?: number = 0;

   @IsNumber()
   @IsOptional()
   renovaciones?: number = 0;

   @IsNumber()
   @IsOptional()
   caja_final?: number = 0;
   
   @IsNumber()
   @IsOptional()
   pretendido?: number = 0;

   @IsNumber()
   @IsOptional()
   extra?: number = 0;

   @IsMongoId()
   ruta: string; 
}
