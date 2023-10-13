import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Ruta } from '../../ruta/entities/ruta.entity';

@Schema()
export class Caja {
   

   _id?: string;

   @Prop({
      type: String,
      required: true,
      index: true,
      trim: true
   })
   fecha: string;

   @Prop({
      type: Number,
      required: true,
      default: 0
   })
   base: number;

   @Prop({
      type: Number,
      required: true,
      default: 0
   })
   inversion: number;

   @Prop({
      type: Number,
      required: true,
      default: 0
   })
   retiro: number;

   @Prop({
      type: Number,
      required: true,
      default: 0
   })
   gasto: number;

   @Prop({
      type: Number,
      required: true,
      default: 0
   })
   cobro: number; 
   
   @Prop({
      type: Number,
      required: true,
      default: 0
   })
   prestamo: number;

   @Prop({
      type: Number,
      required: true,
      default: 0
   })
   total_clientes: number;
   
   @Prop({
      type: Number,
      required: true,
      default: 0
   })
   clientes_pendientes: number;

   @Prop({
      type: Number,
      required: true,
      default: 0
   })
   renovaciones: number;

   @Prop({
      type: Number,
      required: true,
      default: 0
   })
   caja_final: number;
   
   @Prop({
      type: Number,
      required: true,
      default: 0
   })
   pretendido: number;

   @Prop({
      type: Number,
      default: 0
   })
   extra: number;

   @Prop({
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ruta',
      required: true
   })
   ruta: Ruta; 
   
}

export const CajaSchema = SchemaFactory.createForClass(Caja);
