import { Module } from '@nestjs/common';
import { RolService } from './rol.service';
import { RolController } from './rol.controller';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Rol, RolSchema } from './entities/rol.entity';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      {
        name: Rol.name,
        schema: RolSchema
      }
    ])
  ],
  controllers: [RolController],
  providers: [RolService],
  exports: [
    RolService,
    MongooseModule
  ]
})
export class RolModule {}
