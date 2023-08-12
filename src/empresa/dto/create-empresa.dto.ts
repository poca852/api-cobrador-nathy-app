import { IsBoolean, IsOptional, IsString, Min } from "class-validator";

export class CreateEmpresaDto {

   @IsString()
   @Min(3)
   name: string;

   @IsBoolean()
   @IsOptional()
   haveLoginFalse?: boolean = false;

   @IsString()
   @Min(3)
   country: string;

   @IsString()
   currency: string;

}