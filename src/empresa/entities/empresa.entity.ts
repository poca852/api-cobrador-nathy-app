import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Empresa extends Document {

   @Prop({
      type: String,
      index: true,
      trim: true,
      uppercase: true
   })
   name: string;

   @Prop({
      type: Boolean,
      default: false
   })
   haveLoginFalse: boolean;

   @Prop({
      type: Number,
      default: 19
   })
   dayOfPay: number;

   @Prop({
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true
   })
   country: string;

   @Prop({
      type: String,
      required: true,
      trim: true,
      uppercase: true
   })
   currency: string;

}

export const EmpresaSchema = SchemaFactory.createForClass(Empresa);
