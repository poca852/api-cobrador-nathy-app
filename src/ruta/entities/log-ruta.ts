import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, {Document} from "mongoose";
import { User } from '../../auth/entities/user.entity';
import { Ruta } from 'src/ruta/entities/ruta.entity';
const moment = require('moment-timezone');
moment.tz.setDefault("America/Guatemala");

@Schema()
export class LogRuta extends Document {

   @Prop({
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
   })
   user: User;

   @Prop({
      type: String,
      default: moment().format('YYYY-MM-DD HH:mm:ss')
   })
   date: string;

   @Prop({
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ruta'
   })
   ruta: Ruta;
  
  
}

export const LogRutaSchema = SchemaFactory.createForClass(LogRuta);
