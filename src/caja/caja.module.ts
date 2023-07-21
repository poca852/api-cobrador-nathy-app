import { Module } from '@nestjs/common';
import { CajaService } from './caja.service';
import { CajaController } from './caja.controller';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Caja, CajaSchema } from './entities/caja.entity';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      {
        name: Caja.name,
        schema: CajaSchema
      }
    ])
  ],
  controllers: [CajaController],
  providers: [CajaService],
  exports: [CajaService, MongooseModule]
})
export class CajaModule {}
