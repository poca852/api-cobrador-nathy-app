import { Module } from '@nestjs/common';
import { CountryService } from './country.service';
import { CountryController } from './country.controller';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from 'src/auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Citie, CitieSchema, Countrie, CountrieSchema, State, StateSchema, } from './entities';

@Module({
  imports: [
    ConfigModule,
    AuthModule,
    MongooseModule.forFeature([
      {
        name: Citie.name,
        schema: CitieSchema
      },
      {
        name: State.name,
        schema: StateSchema
      },
      {
        name: Countrie.name,
        schema: CountrieSchema
      },
    ])
  ],
  controllers: [CountryController],
  providers: [CountryService],
  exports: [CountryService, MongooseModule]
})
export class CountryModule {}
