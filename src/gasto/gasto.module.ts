import { Module } from '@nestjs/common';
import { GastoService } from './gasto.service';
import { GastoController } from './gasto.controller';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Gasto, GastoSchema } from './entities/gasto.entity';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      {
        name: Gasto.name,
        schema: GastoSchema
      }
    ])
  ],
  controllers: [GastoController],
  providers: [GastoService],
  exports: [GastoService, MongooseModule]
})
export class GastoModule {}
