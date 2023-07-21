import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, {Document} from "mongoose";

import { Rol } from "../../rol/entities/rol.entity";
import { Ruta } from "src/ruta/entities/ruta.entity";

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
      required: true
   })
   password?: string;

   @Prop({
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rol"
   })
   rol: Rol;
   
   @Prop({
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ruta"
   })
   ruta: Ruta;
   
   @Prop({
      type: String,
      required: true,
      default: "1"
   })
   fecha_cobro: string;

   @Prop({
      type: [{
         type: mongoose.Schema.Types.ObjectId,
         ref: "Ruta"
      }]
   })
   rutas: Ruta[];

   /*@Prop({
      type: mongoose.Schema.Types.ObjectId,
      ref: "Empresa"
   })
   empresa: Empresa;*/

}

export const UserSchema = SchemaFactory.createForClass(User);
