import { Module } from '@nestjs/common';
import { PruebasService } from './pruebas.service';
import { PruebasController } from './pruebas.controller';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Credito, CreditoSchema } from 'src/credito/entities/credito.entity';
import { Gasto, GastoSchema } from 'src/gasto/entities/gasto.entity';
import { RutaModule } from '../ruta/ruta.module';

@Module({
  imports: [
    ConfigModule,
    RutaModule,
    MongooseModule.forFeature([
      {
        name: Credito.name,
        schema: CreditoSchema
      },  
      {
        name: Gasto.name,
        schema: GastoSchema
      }  
    ])
  ],
  controllers: [PruebasController],
  providers: [PruebasService]
})
export class PruebasModule {}
