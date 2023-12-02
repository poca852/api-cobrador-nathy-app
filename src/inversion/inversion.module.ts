import { Module } from '@nestjs/common';
import { InversionService } from './inversion.service';
import { InversionController } from './inversion.controller';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Inversion, InversionSchema } from './entities/inversion.entity';
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
        name: Inversion.name,
        schema: InversionSchema
      }
    ])
  ],
  controllers: [InversionController],
  providers: [InversionService, MomentService],
  exports: [InversionService, MongooseModule]
})
export class InversionModule {}
