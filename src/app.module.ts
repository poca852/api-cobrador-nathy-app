import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { RolModule } from './rol/rol.module';
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

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URI),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname,"..",'public'),
    }),
    AuthModule,
    RolModule,
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
    PruebasModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
