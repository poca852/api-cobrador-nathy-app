import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class ListGasto {

   @Prop({
      type: String,
      index: true,
      unique: true,
      trim: true,
      uppercase: true
   })
   gasto: string;

}

export const ListGastoSchema = SchemaFactory.createForClass(ListGasto);
