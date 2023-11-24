import { Controller, Get, Param } from '@nestjs/common';
import { CountryService } from './country.service';
import { Auth } from 'src/auth/decorators';

@Auth()
@Controller('country')
export class CountryController {
  constructor(private readonly countryService: CountryService) {}

  @Get(':region')
  findCountry(
    @Param('region') region: string
  ) {
    return this.countryService.findCountry(region);
  }

  @Get('state/:country')
  findState(
    @Param('country') country: string) {
    return this.countryService.findStates(country);
  }

  @Get('city/:state')
  findCity(
    @Param('state') state: string) {
    return this.countryService.findCities(state);
  }

}
