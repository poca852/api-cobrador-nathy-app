import mongoose from 'mongoose';
import { Ruta } from '../../ruta/entities/ruta.entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Inversion {

   @Prop({
      type: String
   })
   fecha: string; 

   @Prop({
      type: Number
   })
   valor: number; 

   @Prop({
      type: String,
      uppercase: true
   })
   nota: string; 
   
   @Prop({
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ruta'
   })
   ruta: Ruta 
}

export const InversionSchema = SchemaFactory.createForClass(Inversion)
