import { Module } from '@nestjs/common';
import { RutaService } from './ruta.service';
import { RutaController } from './ruta.controller';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Ruta, RutaSchema } from './entities/ruta.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      {
        name: Ruta.name,
        schema: RutaSchema
      }
    ]),
    AuthModule
  ],
  controllers: [RutaController],
  providers: [RutaService],
  exports: [RutaService, MongooseModule]
})
export class RutaModule {}
