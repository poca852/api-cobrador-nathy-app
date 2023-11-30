import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { CreditoModule } from '../credito/credito.module';
import { EmpresaModule } from '../empresa/empresa.module';
import { RutaModule } from '../ruta/ruta.module';
import { MomentService } from '../common/plugins/moment/moment.service';

@Module({
  imports: [
    ConfigModule,
    AuthModule,
    CreditoModule,
    EmpresaModule,
    RutaModule
  ],
  controllers: [ReportsController],
  providers: [ReportsService, MomentService],
  exports: [ReportsService],
})
export class ReportsModule {}
