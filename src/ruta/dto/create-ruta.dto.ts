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
  
   @IsNumber()
   @IsOptional()
   ciudad?: string;
  
   @IsNumber()
   @IsOptional()
   cartera?: number
  
   @IsNumber()
   @IsOptional()
   total_cobrado?: number;
  
   @IsNumber()
   @IsOptional()
   total_prestado?: number;
  
   @IsBoolean()
   @IsOptional()
   status?: boolean;
  
   @IsString()
   @IsOptional()
   ultimo_cierre?: string;
  
   @IsString()
   ultima_apertura?: string;
  
   @IsBoolean()
   @IsOptional()
   ingresar_gastos_cobrador?: boolean;
  
   @IsMongoId()
   @IsOptional()
   caja_actual?: string;
  
   @IsMongoId()
   @IsOptional()
   ultima_caja?: string;
  
   @IsNumber()
   @IsOptional()
   turno?: number = 1;
  
   /*@Prop({ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Empresa'
   })
   empresa: Empresa;*/
}
