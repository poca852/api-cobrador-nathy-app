import { Module } from '@nestjs/common';
import { CreditoService } from './credito.service';
import { CreditoController } from './credito.controller';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Credito, CreditoSchema } from './entities/credito.entity';
import { Cliente, ClienteSchema } from '../cliente/entities/cliente.entity';
import { CajaModule } from '../caja/caja.module';
import { AuthModule } from '../auth/auth.module';
import { ClienteModule } from '../cliente/cliente.module';
import { RutaSchema } from 'src/ruta/entities/ruta.entity';
import { Ruta } from '../ruta/entities/ruta.entity';
import { MomentService } from '../common/plugins/moment/moment.service';
import { EmpresaModule } from '../empresa/empresa.module';

@Module({
  imports: [
    AuthModule,
    ConfigModule,
    CajaModule,
    ClienteModule,
    EmpresaModule,
    MongooseModule.forFeature([
      {
        name: Credito.name,
        schema: CreditoSchema
      },
      {
        name: Cliente.name,
        schema: ClienteSchema
      },
      {
        name: Ruta.name,
        schema: RutaSchema
      }
    ])
  ],
  controllers: [CreditoController],
  providers: [CreditoService, MomentService],
  exports: [CreditoService, MongooseModule]
})
export class CreditoModule {}
