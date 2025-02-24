import { Module, forwardRef } from '@nestjs/common';
import { RutaService } from './ruta.service';
import { RutaController } from './ruta.controller';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Ruta, RutaSchema } from './entities/ruta.entity';
import { AuthModule } from 'src/auth/auth.module';
import { Credito, CreditoSchema } from '../credito/entities/credito.entity';
import { Gasto, GastoSchema } from '../gasto/entities/gasto.entity';
import { Cliente, ClienteSchema } from '../cliente/entities/cliente.entity';
import { Inversion, InversionSchema } from '../inversion/entities/inversion.entity';
import { Retiro, RetiroSchema } from '../retiro/entities/retiro.entity';
import { Caja, CajaSchema } from '../caja/entities/caja.entity';
import { CajaModule } from '../caja/caja.module';
import { LogRuta, LogRutaSchema } from './entities/log-ruta';
import { MomentService } from 'src/common/plugins/moment/moment.service';
import { MessageModule } from 'src/message/message.module';

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => CajaModule),
    forwardRef(() => AuthModule),
    MongooseModule.forFeature([
      {
        name: Ruta.name,
        schema: RutaSchema
      },
      {
        name: LogRuta.name,
        schema: LogRutaSchema
      },
      {
        name: Credito.name,
        schema: CreditoSchema
      },
      {
        name: Gasto.name,
        schema: GastoSchema
      },
      {
        name: Cliente.name,
        schema: ClienteSchema
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
        name: Caja.name,
        schema: CajaSchema
      }
    ]),
    MessageModule,
  ],
  controllers: [RutaController],
  providers: [RutaService, MomentService],
  exports: [RutaService, MongooseModule]
})
export class RutaModule {}
