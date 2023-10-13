import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { User } from '../../auth/entities/user.entity';
import { Caja } from './caja.entity';

@Schema()
export class CierreCaja {

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    })
    user: User;

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Caja',
        required: true
    })
    caja: Caja;

    @Prop({
        type: Number,
        required: true
    })
    saldo: number;

    @Prop({
        type: Date,
        required: true
    })
    date: Date;

}

export const CierreCajaSchema = SchemaFactory.createForClass(CierreCaja);
