import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";


@Schema()
export class Citie extends Document {

   @Prop({
      type: Number,
      index: true
   })
   id: number;

   @Prop({
      type: Number,
   })
   id_state: number;

   @Prop({
      type: String,
      index: true,
   })
   name: string;
   
}

export const CitieSchema = SchemaFactory.createForClass(Citie);
