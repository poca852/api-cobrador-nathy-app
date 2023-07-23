import { IsMongoId, IsOptional, IsString } from "class-validator";
import { Ruta } from '../../ruta/entities/ruta.entity';

export class GlobalParams {

   @IsMongoId()
   @IsOptional()
   ruta?: string;

   @IsMongoId()
   @IsOptional()
   userId?: string;

   @IsString()
   @IsOptional()
   fecha?: string;

}