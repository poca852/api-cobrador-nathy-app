import { IsArray, IsBoolean, IsMongoId, IsOptional, IsString, MinLength } from "class-validator";

export class CreateClienteDto {
   
   @IsBoolean()
   @IsOptional()
   status?: boolean = false;  
   
   
   @IsBoolean()
   @IsOptional()
   state?: boolean = true; 
   
   @IsString()
   @MinLength(6)
   dpi: string;

   @IsString()
   @MinLength(5)
   nombre: string;

   @IsString()
   @MinLength(4)
   alias: string; 

   @IsString()
   @MinLength(4)
   ciudad: string;

   @IsString()
   direccion: string;
   
   @IsString()
   telefono: string;
   
   @IsString()
   @IsOptional()
   img?: string;
   
   @IsMongoId()
   ruta: string; 

   @IsMongoId({
      each: true
   })
   @IsArray()
   @IsOptional()
   creditos?: string[];
}
