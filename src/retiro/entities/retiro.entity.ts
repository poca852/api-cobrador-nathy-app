import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Ruta } from '../../ruta/entities/ruta.entity';
import mongoose from 'mongoose';

@Schema()
export class Retiro {

   @Prop({
      type: String,
      required: true
   })
   fecha: string; 

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
      ref: 'RutaModel'
   })
   ruta: Ruta; 

}

export const RetiroSchema = SchemaFactory.createForClass(Retiro);
