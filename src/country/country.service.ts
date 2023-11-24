import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Citie, Countrie, State } from './entities';
import { Model } from 'mongoose';

@Injectable()
export class CountryService {

  constructor(

    @InjectModel(Countrie.name)
    private countryModel: Model<Countrie>,

    @InjectModel(State.name)
    private stateModel: Model<State>,

    @InjectModel(Citie.name)
    private cityModel: Model<Citie>,

  ) {}


  async findCountryByName(name: string ) {
    try {
      return this.countryModel.findOne({name});
    } catch (error) {
      throw new NotFoundException(`Pais con el nombre ${name} no existe`)
    }

  }

  async findStateByName(name: string ) {
    try {
      return this.stateModel.findOne({name});
    } catch (error) {
      throw new NotFoundException(`Estado con el nombre ${name} no existe`)
    }

  }

  async findCityByName(name: string ) {
    try {
      return this.cityModel.findOne({name});
    } catch (error) {
      throw new NotFoundException(`Ciudad con el nombre ${name} no existe`)
    }

  }

  async findCountry( region?: string ) {
    
    if(region) {

      return await this.countryModel.find({
        region: region
      })

    }

    return await this.countryModel.find();

  }

  async findStates(country: string) {

    const pais = await this.findCountryByName(country);

    return await this.stateModel.find({
      id_country: pais.id
    })
    
  }

  async findCities(state_n: string) {

    const state = await this.findStateByName(state_n);

    return await this.cityModel.find({
      id_state: state.id
    })
    
  }

}
