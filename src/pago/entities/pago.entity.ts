import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Cliente } from '../../cliente/entities/cliente.entity';
import mongoose from "mongoose";
import { Credito } from '../../credito/entities/credito.entity';
import { Ruta } from '../../ruta/entities/ruta.entity';

@Schema()
export class Pago {
   @Prop({
      type: String
   })
   fecha: string; 

   @Prop({
      type: Number
   })
   valor: number; 

   @Prop({
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ruta'
   })
   ruta: Ruta; 

   @Prop({
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Credito'
   })
   credito: Credito; 

   @Prop({
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cliente'
   })
   cliente: Cliente;
}

export const PagoSchema = SchemaFactory.createForClass(Pago);
