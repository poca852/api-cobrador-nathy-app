import { Schema, SchemaFactory, Prop } from "@nestjs/mongoose";
import mongoose, { Document } from "mongoose";
import { User } from '../../auth/entities/user.entity';
const moment = require('moment-timezone');
moment.tz.setDefault("America/Guatemala");

@Schema()
export class LogAuth extends Document {

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    })
    user: User;

    @Prop({
        type: Boolean,
        required: true
    })
    isSuccessful: boolean;

    @Prop({
        type: String,
        default: moment().format('YYYY-MM-DD HH:mm:ss')
    })
    date: string;

    @Prop({
        type: String,
    })
    reason: string;

}

export const LogAuthSchema = SchemaFactory.createForClass(LogAuth);