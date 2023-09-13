import { Module } from '@nestjs/common';
import { ClienteService } from './cliente.service';
import { ClienteController } from './cliente.controller';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Cliente, ClienteSchema } from './entities/cliente.entity';
import { AuthModule } from 'src/auth/auth.module';
import { Credito, CreditoSchema } from 'src/credito/entities/credito.entity';

@Module({
  imports: [
    ConfigModule,
    AuthModule,
    MongooseModule.forFeature([
      {
        name: Cliente.name,
        schema: ClienteSchema
      },
      {
        name: Credito.name,
        schema: CreditoSchema
      }
    ])
  ],
  controllers: [ClienteController],
  providers: [ClienteService],
  exports: [ClienteService, MongooseModule]
})
export class ClienteModule {}
