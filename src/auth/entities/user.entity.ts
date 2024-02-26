import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, {Document} from "mongoose";

import { Ruta } from "src/ruta/entities/ruta.entity";
import { Empresa } from "src/empresa/entities/empresa.entity";

@Schema()
export class User extends Document {
   
   @Prop({
      type: String,
      index: true,
      required: true,
      uppercase: true,
      trim: true
   })
   nombre: string;

   @Prop({
      type: Boolean,
      required: true,
      default: true
   })
   estado: boolean;

   @Prop({
      type: String,
      index: true,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
   })
   username: string;

   @Prop({
      type: String,
      required: true,
   })
   password?: string;

   @Prop({
      type: String,
      enum: ['ADMIN', 'SUPERADMIN', 'COBRADOR', 'SUPERVISOR', 'CLIENTE'],
      default: 'COBRADOR'
   })
   rol: string;
   
   @Prop({
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ruta"
   })
   ruta: Ruta;

   @Prop({
      type: [{
         type: mongoose.Schema.Types.ObjectId,
         ref: "Ruta"
      }]
   })
   rutas: Ruta[];

   @Prop({
      type: mongoose.Schema.Types.ObjectId,
      ref: "Empresa"
   })
   empresa: Empresa;

   @Prop({ type: Boolean })
   close_ruta: boolean;

}

export const UserSchema = SchemaFactory.createForClass(User);
