import { Module, forwardRef } from '@nestjs/common';
import { CajaService } from './caja.service';
import { CajaController } from './caja.controller';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule, Schema } from '@nestjs/mongoose';
import { Caja, CajaSchema } from './entities/caja.entity';
import { Gasto, GastoSchema } from '../gasto/entities/gasto.entity';
import { Inversion, InversionSchema } from '../inversion/entities/inversion.entity';
import { Retiro, RetiroSchema } from '../retiro/entities/retiro.entity';
import { Credito, CreditoSchema } from '../credito/entities/credito.entity';
import { Cliente, ClienteSchema } from '../cliente/entities/cliente.entity';
import { Pago, PagoSchema } from '../pago/entities/pago.entity';
import { AuthModule } from 'src/auth/auth.module';
import { CierreCaja, CierreCajaSchema } from './entities/cierre_caja.entity';
import { RutaModule } from 'src/ruta/ruta.module';
import { MomentService } from '../common/plugins/moment/moment.service';

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => AuthModule),
    forwardRef(() => RutaModule),
    MongooseModule.forFeature([
      {
        name: Caja.name,
        schema: CajaSchema
      },
      {
        name: Gasto.name,
        schema: GastoSchema
      },
      {
        name: Inversion.name,
        schema: InversionSchema
      },
      {
        name: Retiro.name,
        schema: RetiroSchema
      },
      {
        name: Credito.name,
        schema: CreditoSchema
      },
      {
        name: Cliente.name,
        schema: ClienteSchema
      },
      {
        name: Pago.name,
        schema: PagoSchema
      },
      {
        name: CierreCaja.name,
        schema: CierreCajaSchema
      }
    ])
  ],
  controllers: [CajaController],
  providers: [CajaService, MomentService],
  exports: [CajaService, MongooseModule]
})
export class CajaModule {}
