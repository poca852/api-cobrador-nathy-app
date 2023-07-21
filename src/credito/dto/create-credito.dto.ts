import { IsBoolean, IsDecimal, IsMongoId, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateCreditoDto {

   @IsMongoId()
   @IsOptional()
   pagos?: string[] 

   @IsBoolean()
   @IsOptional()
   status?: boolean = true;

   @IsNumber()
   valor_credito: number;
   
   @IsNumber()
   interes: number;

   @IsNumber()
   total_cuotas: number

   @IsNumber()
   total_pagar: number;

   @IsNumber()
   @IsOptional()
   abonos?: number = 0; 
   
   @IsNumber()
   saldo: number; 

   @IsNumber()
   valor_cuota: number;

   @IsString()
   fecha_inicio: string;

   @IsMongoId()
   cliente: string;

   @IsMongoId()
   ruta: string; 
   
   @IsString()
   @IsOptional()
   ultimo_pago?: string = "";

   @IsString()
   @IsOptional()
   notas?: string; 

   @IsNumber()
   @IsOptional()
   turno?: number; 
}
