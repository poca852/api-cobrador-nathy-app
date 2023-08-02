import { UnauthorizedException, Injectable } from '@nestjs/common';
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { User } from '../entities/user.entity';
import { JwtPayload } from "../interfaces/jwt-payload.interface";

@Injectable()
export class JWTStrategy extends PassportStrategy(Strategy){

  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,

    configService: ConfigService
  ){
    super({
      secretOrKey: configService.get('SECRETORPRIVATEKEY'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
    });
  }

  async validate(payload: JwtPayload): Promise<User>{
    const {id} = payload;
    
    const user = await this.userModel.findById(id)
      .populate({
        path: "rol",
        select: "rol"
      })
      .populate("ruta")

    if(!user)
      throw new UnauthorizedException('Token no valid');
    
    if(!user.estado)
      throw new UnauthorizedException('usuario no esta activo');

    return user;
  }

}