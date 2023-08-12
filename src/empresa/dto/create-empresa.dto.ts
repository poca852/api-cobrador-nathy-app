import { IsBoolean, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreateEmpresaDto {

   @IsString()
   name: string;

   @IsBoolean()
   @IsOptional()
   haveLoginFalse?: boolean = false;

   @IsNumber()
   @IsOptional()
   dayOfPay?: number;

   @IsString()
   country: string;

   @IsString()
   currency: string;

}