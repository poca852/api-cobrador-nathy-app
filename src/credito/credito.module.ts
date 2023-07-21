import { Module } from '@nestjs/common';
import { CreditoService } from './credito.service';
import { CreditoController } from './credito.controller';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Credito, CreditoSchema } from './entities/credito.entity';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      {
        name: Credito.name,
        schema: CreditoSchema
      }
    ])
  ],
  controllers: [CreditoController],
  providers: [CreditoService],
  exports: [CreditoService, MongooseModule]
})
export class CreditoModule {}
