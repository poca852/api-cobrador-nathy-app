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
      type: String,
      required: true
   })
   country: string;

   @Prop({
      type: String,
      required: true
   })
   currency: string;

}

export const EmpresaSchema = SchemaFactory.createForClass(Empresa);
