import { Module } from '@nestjs/common';
import { PruebasService } from './pruebas.service';
import { PruebasController } from './pruebas.controller';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Credito, CreditoSchema } from 'src/credito/entities/credito.entity';

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
  controllers: [PruebasController],
  providers: [PruebasService]
})
export class PruebasModule {}
