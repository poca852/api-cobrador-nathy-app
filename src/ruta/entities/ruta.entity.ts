import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, {Document} from "mongoose";
import { Caja } from 'src/caja/entities/caja.entity';
import { Empresa } from '../../empresa/entities/empresa.entity';

@Schema()
export class Ruta extends Document {

   @Prop({
      type: String,
      required: true,
      index: true,
      trim: true,
      uppercase: true
   })
   nombre: string
  
   @Prop({
      type: Number,
      default: 0
   })
   clientes: number;
  
   @Prop({
      type: Number,
      default: 0
    })
   clientes_activos: number;
  
   @Prop({
      type: Number,
      default: 0
   })
   gastos: number;
   
   @Prop({
      type: Number,
      default: 0
   })
   inversiones: number;
  
   @Prop({
      type: Number,
      default: 0
   })
   retiros: number;
  
   @Prop({
      type: String,
      required: true,
   })
   ciudad: string;
  
   @Prop({
      type: Number,
      default: 0
   })
   cartera: number
  
   @Prop({
      type: Number,
      default: 0
   })
   total_cobrado: number;
  
   @Prop({
      type: Number,
      default: 0
   })
   total_prestado: number;
  
   @Prop({
      type: Boolean,
      default: false
   })
   status: boolean

   @Prop({
      type: Boolean,
      default: false
   })
   isLocked: boolean;

   @Prop({
      type: String
   })
   pais: string;

   @Prop({
      type: String
   })
   estado: string;
  
   @Prop({
      type: String
   })
   ultimo_cierre: string;
  
   @Prop({
      type: String
   })
   ultima_apertura: string;
  
   @Prop({
      type: Boolean,
      default: true
   })
   ingresar_gastos_cobrador: boolean;
  
   @Prop({
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Caja'
   })
   caja_actual: Caja;
  
   @Prop({
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Caja'
   })
   ultima_caja: Caja;
  
   @Prop({
      type: Number,
      default: 1
   })
   turno: number;
  
   @Prop({ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Empresa'
   })
   empresa: Empresa;

   @Prop({ type: Boolean, required: true })
   have_login_falso: boolean;

   @Prop({ type: String })
   senha: string;

   @Prop({ type: Boolean, required: true })
   autoOpen: boolean;
  
}

export const RutaSchema = SchemaFactory.createForClass(Ruta);
