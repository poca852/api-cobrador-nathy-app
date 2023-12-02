import { Module } from '@nestjs/common';
import { RetiroService } from './retiro.service';
import { RetiroController } from './retiro.controller';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Retiro, RetiroSchema } from './entities/retiro.entity';
import { AuthModule } from 'src/auth/auth.module';
import { MomentService } from '../common/plugins/moment/moment.service';
import { CajaModule } from '../caja/caja.module';

@Module({
  imports: [
    ConfigModule,
    AuthModule,
    CajaModule,
    MongooseModule.forFeature([
      {
        name: Retiro.name,
        schema: RetiroSchema
      }
    ])
  ],
  controllers: [RetiroController],
  providers: [RetiroService, MomentService],
  exports: [RetiroService, MongooseModule]
})
export class RetiroModule {}
