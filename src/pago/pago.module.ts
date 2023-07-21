import { Module } from '@nestjs/common';
import { PagoService } from './pago.service';
import { PagoController } from './pago.controller';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Pago, PagoSchema } from './entities/pago.entity';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      {
        name: Pago.name,
        schema: PagoSchema
      }
    ])
  ],
  controllers: [PagoController],
  providers: [PagoService],
  exports: [PagoService, MongooseModule]
})
export class PagoModule {}
