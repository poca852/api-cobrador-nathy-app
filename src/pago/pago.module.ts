import { Module } from '@nestjs/common';
import { PagoService } from './pago.service';
import { PagoController } from './pago.controller';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Pago, PagoSchema } from './entities/pago.entity';
import { AuthModule } from 'src/auth/auth.module';
import { Credito, CreditoSchema } from '../credito/entities/credito.entity';
import { Cliente, ClienteSchema } from 'src/cliente/entities/cliente.entity';
import { CreditoModule } from '../credito/credito.module';
import { RutaModule } from '../ruta/ruta.module';

@Module({
  imports: [
    ConfigModule,
    AuthModule,
    CreditoModule,
    RutaModule,
    MongooseModule.forFeature([
      {
        name: Pago.name,
        schema: PagoSchema
      },
      {
        name: Credito.name,
        schema: CreditoSchema
      },
      {
        name: Cliente.name,
        schema: ClienteSchema
      }
    ])
  ],
  controllers: [PagoController],
  providers: [PagoService],
  exports: [PagoService, MongooseModule]
})
export class PagoModule {}
