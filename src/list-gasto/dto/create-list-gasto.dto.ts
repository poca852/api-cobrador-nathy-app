import { IsString } from "class-validator";

export class CreateListGastoDto {

   @IsString()
   gasto: string;
   
}
