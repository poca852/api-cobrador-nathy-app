import { Module } from '@nestjs/common';
import { InversionService } from './inversion.service';
import { InversionController } from './inversion.controller';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Inversion, InversionSchema } from './entities/inversion.entity';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      {
        name: Inversion.name,
        schema: InversionSchema
      }
    ])
  ],
  controllers: [InversionController],
  providers: [InversionService],
  exports: [InversionService, MongooseModule]
})
export class InversionModule {}
