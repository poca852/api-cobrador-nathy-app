import { IsString, IsNumber, IsOptional, IsBoolean, IsMongoId } from "class-validator";

export class CreateRutaDto {

   @IsString()
   nombre: string;

   @IsNumber()
   @IsOptional()
   clientes?: number;
  
   @IsNumber()
   @IsOptional()
   clientes_activos?: number; 
  
   @IsNumber()
   @IsOptional()
   gastos?: number;
   
   @IsNumber()
   @IsOptional()
   inversiones?: number;
  
   @IsNumber()
   @IsOptional()
   retiros?: number;
  
   @IsString()
   ciudad: string;
  
   @IsNumber()
   @IsOptional()
   cartera?: number;
  
   @IsNumber()
   @IsOptional()
   total_cobrado?: number;
  
   @IsNumber()
   @IsOptional()
   total_prestado?: number;
  
   @IsBoolean()
   @IsOptional()
   status?: boolean;

   @IsBoolean()
   @IsOptional()
   isLocked?: boolean;
  
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
   turno?: number;
  
   @IsMongoId()
   @IsOptional()
   empresa?: string;

   @IsBoolean()
   @IsOptional()
   have_login_falso: boolean = true;

   @IsString()
   pais: string;

   @IsString()
   estado: string;

   @IsString()
   @IsOptional()
   senha?: string;

   @IsBoolean()
   @IsOptional()
   autoOpen: boolean = true;

}
