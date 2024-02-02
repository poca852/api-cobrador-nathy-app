import { IsBoolean, IsDecimal, IsEnum, IsMongoId, IsNumber, IsOptional, IsString } from "class-validator";

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
   @IsOptional()
   interes?: number;

   @IsNumber()
   @IsOptional()
   total_cuotas?: number

   @IsNumber()
   total_pagar: number;

   @IsNumber()
   @IsOptional()
   abonos?: number; 
   
   @IsNumber()
   saldo: number; 

   @IsNumber()
   @IsOptional()
   valor_cuota?: number;

   @IsString()
   fecha_inicio: string;

   @IsMongoId()
   cliente: string;

   @IsMongoId()
   ruta: string; 
   
   @IsString()
   @IsOptional()
   ultimo_pago?: string;

   @IsString()
   @IsOptional()
   notas?: string; 

   @IsNumber()
   @IsOptional()
   turno?: number = 1; 

   @IsOptional()
   @IsBoolean()
   esAutomatico?: boolean;

   @IsString()
   @IsEnum(['diario', 'semanal', 'mensual'])
   frecuencia_cobro: string;

   @IsBoolean()
   se_cobran_domingos: boolean;

   @IsString()
   @IsOptional()
   @IsEnum(['BUENO', 'REGULAR', 'MALO'])
   state?: string = 'BUENO';
}
