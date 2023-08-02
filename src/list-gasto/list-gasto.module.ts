import { Module } from '@nestjs/common';
import { ListGastoService } from './list-gasto.service';
import { ListGastoController } from './list-gasto.controller';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ListGasto, ListGastoSchema } from './entities/list-gasto.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    ConfigModule,
    AuthModule,
    MongooseModule.forFeature([
      {
        name: ListGasto.name,
        schema: ListGastoSchema
      }
    ])
  ],
  controllers: [ListGastoController],
  providers: [ListGastoService],
  exports: [ListGastoService, MongooseModule]
})
export class ListGastoModule {}
