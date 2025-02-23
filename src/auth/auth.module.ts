import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User, UserSchema } from './entities/user.entity';
import { JWTStrategy } from './strategies/jwt.strategy';
import { RutaModule } from '../ruta/ruta.module';
import { CierreCaja, CierreCajaSchema } from '../caja/entities/cierre_caja.entity';
import { LogAuth, LogAuthSchema } from '../log-auth/entities/log-auth.entity';
import { MomentService } from 'src/common/plugins/moment/moment.service';

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => RutaModule),
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema
      },
      {
        name: CierreCaja.name,
        schema: CierreCajaSchema
      },
      {
        name: LogAuth.name,
        schema: LogAuthSchema
      }
    ]),
    PassportModule.register({
      defaultStrategy: "jwt"
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get("SECRETORPRIVATEKEY"),
          signOptions: {
            expiresIn: "1h"
          }
        }
      }
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, JWTStrategy, MomentService],
  exports: [MongooseModule, AuthService, JWTStrategy, PassportModule, JwtModule]
})
export class AuthModule {}
