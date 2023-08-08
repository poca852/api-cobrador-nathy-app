import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { ListGasto } from '../../list-gasto/entities/list-gasto.entity';
import mongoose from "mongoose";
import { Ruta } from "src/ruta/entities/ruta.entity";

@Schema()
export class Gasto {

   @Prop({
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ListGasto',
      required: true
   })
   gasto: ListGasto;

   @Prop({
      type: Date,
      default: Date.now,
      required: true
   })
   fecha: Date; 
   
   @Prop({
      type: Number,
      required: true
   })
   valor: number; 

   @Prop({
      type: String,
      uppercase: true,
      trim: true
   })
   nota: string; 

   @Prop({
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ruta'
   })
   ruta: Ruta; 
}

export const GastoSchema = SchemaFactory.createForClass(Gasto)
