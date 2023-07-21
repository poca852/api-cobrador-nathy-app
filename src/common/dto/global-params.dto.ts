import { IsMongoId, IsOptional } from "class-validator";
import { Ruta } from '../../ruta/entities/ruta.entity';

export class GlobalParams {

   @IsMongoId()
   @IsOptional()
   ruta?: Ruta;

}