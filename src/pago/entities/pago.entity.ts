import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Cliente } from '../../cliente/entities/cliente.entity';
import mongoose, {Document} from "mongoose";
import { Credito } from '../../credito/entities/credito.entity';
import { Ruta } from '../../ruta/entities/ruta.entity';

@Schema()
export class Pago extends Document {
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

   @Prop({
      type: String
   })
   observacion: string;
}

export const PagoSchema = SchemaFactory.createForClass(Pago);
