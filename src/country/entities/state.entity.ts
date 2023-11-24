import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from 'mongoose';

@Schema()
export class State extends Document {

   @Prop({
      type: Number,
      index: true
   })
   id: number;

   @Prop({
      type: Number,
   })
   id_country: number;

   @Prop({
      type: String,
      index: true,
   })
   name: string;

}

export const StateSchema = SchemaFactory.createForClass(State);
