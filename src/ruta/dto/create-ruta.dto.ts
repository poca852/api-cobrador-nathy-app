import { IsString, IsNumber, IsOptional, IsBoolean, IsMongoId } from "class-validator";

export class CreateRutaDto {

   @IsString()
   nombre: string;

   @IsNumber()
   @IsOptional()
   clientes?: number = 0;
  
   @IsNumber()
   @IsOptional()
   clientes_activos?: number = 0; 
  
   @IsNumber()
   @IsOptional()
   gastos?: number = 0;
   
   @IsNumber()
   @IsOptional()
   inversiones?: number = 0;
  
   @IsNumber()
   @IsOptional()
   retiros?: number = 0;
  
   @IsString()
   ciudad: string;
  
   @IsNumber()
   @IsOptional()
   cartera?: number = 0;
  
   @IsNumber()
   @IsOptional()
   total_cobrado?: number = 0;
  
   @IsNumber()
   @IsOptional()
   total_prestado?: number = 0;
  
   @IsBoolean()
   @IsOptional()
   status?: boolean = false;
  
   @IsString()
   @IsOptional()
   ultimo_cierre?: string;
  
   @IsString()
   @IsOptional()
   ultima_apertura?: string;
  
   @IsBoolean()
   @IsOptional()
   ingresar_gastos_cobrador?: boolean = true;
  
   @IsMongoId()
   @IsOptional()
   caja_actual?: string;
  
   @IsMongoId()
   @IsOptional()
   ultima_caja?: string;
  
   @IsNumber()
   @IsOptional()
   turno?: number = 1;
  
   @IsMongoId()
   @IsOptional()
   empresa?: string;
}
