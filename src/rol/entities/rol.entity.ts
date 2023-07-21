import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Rol {

   @Prop({
      type: String,
      index: true,
      unique: true,
      trim: true,
      uppercase: true
   })
   rol: string;
}

export const RolSchema = SchemaFactory.createForClass(Rol);
