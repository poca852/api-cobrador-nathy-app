import { Module } from '@nestjs/common';
import { EmpresaService } from './empresa.service';
import { EmpresaController } from './empresa.controller';
import { AuthModule } from '../auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Empresa, EmpresaSchema } from './entities/empresa.entity';

@Module({
  imports: [
    ConfigModule,
    AuthModule,
    MongooseModule.forFeature([
      {
        name: Empresa.name,
        schema: EmpresaSchema
      }
    ])
  ],
  controllers: [EmpresaController],
  providers: [EmpresaService],
  exports: [EmpresaService, MongooseModule]
})
export class EmpresaModule {}
