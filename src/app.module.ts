import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { RutaModule } from './ruta/ruta.module';
import { CajaModule } from './caja/caja.module';
import { EmpresaModule } from './empresa/empresa.module';
import { ClienteModule } from './cliente/cliente.module';
import { CreditoModule } from './credito/credito.module';
import { ListGastoModule } from './list-gasto/list-gasto.module';
import { GastoModule } from './gasto/gasto.module';
import { InversionModule } from './inversion/inversion.module';
import { PagoModule } from './pago/pago.module';
import { RetiroModule } from './retiro/retiro.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PruebasModule } from './pruebas/pruebas.module';
import { FilesModule } from './files/files.module';
import { LogAuthModule } from './log-auth/log-auth.module';
import { CountryModule } from './country/country.module';
import { MessageModule } from './message/message.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true, envFilePath: '.env'}),
    MongooseModule.forRoot(process.env.MONGO_URL, {
      dbName: process.env.MONGO_DB_NAME,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname,"..",'public'),
    }),
    AuthModule,
    RutaModule,
    CajaModule,
    EmpresaModule,
    ClienteModule,
    CreditoModule,
    ListGastoModule,
    GastoModule,
    InversionModule,
    PagoModule,
    RetiroModule,
    PruebasModule,
    FilesModule,
    LogAuthModule,
    CountryModule,
    MessageModule,
    ReportsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
