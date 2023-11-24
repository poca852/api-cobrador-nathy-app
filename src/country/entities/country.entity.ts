import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema()
export class Countrie extends Document {

   @Prop({
      type: Number,
      index: true
   })
   id: number;

   @Prop({
      type: String
   })
   region: string;

   @Prop({
      type: String,
      index: true,
   })
   name: string;

}

export const CountrieSchema = SchemaFactory.createForClass(Countrie);
