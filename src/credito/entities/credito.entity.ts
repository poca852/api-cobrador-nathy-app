import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Pago } from '../../pago/entities/pago.entity';
import { Cliente } from '../../cliente/entities/cliente.entity';
import { Ruta } from 'src/ruta/entities/ruta.entity';

@Schema()
export class Credito extends Document {

   @Prop({
      type: [{
         type: mongoose.Schema.Types.ObjectId,
         ref: "Pago"
      }]
   })
   pagos: Pago[] 

   @Prop({
      type: Boolean,
      required: true
   })
   status: boolean;

   @Prop({
      type: Number,
      required: true
   })
   valor_credito: number;
   
   @Prop({
      type: Number,
      required: true
   })
   interes: number;

   @Prop({
      type: Number,
      required: true
   })
   total_cuotas: number

   @Prop({
      type: Number,
      required: true
   })
   total_pagar: number;

   @Prop({
      type: Number,
      default: 0
   })
   abonos: number; 
   
   @Prop({
      type: Number,
      required: true
   })
   saldo: number; 

   @Prop({
      type: Number,
      required: true
   })
   valor_cuota: number;

   @Prop({
      type: String
   })
   fecha_inicio: string;

   @Prop({
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cliente'
   })
   cliente: Cliente;

   @Prop({
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ruta'
   })
   ruta: Ruta; 
   
   @Prop({
      type: String,
      default: ''
   })
   ultimo_pago: string;

   @Prop({
      type: String
   })
   notas: string; 

   @Prop({
      type: Number,
      required: true
   })
   turno: number;
   
   @Prop({
      type: String,
      enum: ["diario", "semanal", "mensual"]
   })
   frecuencia_cobro: string;

   @Prop({
      type: Boolean,
      default: false
   })
   se_cobran_domingos: boolean;

   @Prop({type: Number})
   atraso?: number;

   @Prop({
      type: String,
      enum: ['BUENO', 'REGULAR', 'MALO'],
      default: 'BUENO'
   })
   state: string;
}

export const CreditoSchema = SchemaFactory.createForClass(Credito)
