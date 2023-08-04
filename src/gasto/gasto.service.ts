import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { CreateGastoDto } from './dto/create-gasto.dto';
import { UpdateGastoDto } from './dto/update-gasto.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Gasto } from './entities/gasto.entity';
import { Model } from 'mongoose';
import { GlobalParams } from 'src/common/dto/global-params.dto';
import { CajaService } from 'src/caja/caja.service';
import { RutaService } from '../ruta/ruta.service';

@Injectable()
export class GastoService {

  private logger = new Logger("GastoService");

  constructor(
    @InjectModel(Gasto.name)
    private readonly gastoModel: Model<Gasto>,

    private cajaService: CajaService,
    private rutaService: RutaService
  ) {}

  async create(createGastoDto: CreateGastoDto): Promise<boolean> {
    try {
      
      await this.gastoModel.create(createGastoDto);
      return true;

    } catch (error) {

      this.handleException(error)

    } 
  }

  findAll() {
    return `This action returns all gasto`;
  }

  findOne(id: number) {
    return `This action returns a #${id} gasto`;
  }

  update(id: number, updateGastoDto: UpdateGastoDto) {
    return `This action updates a #${id} gasto`;
  }

  remove(id: number) {
    return `This action removes a #${id} gasto`;
  }

  private handleException(error: any) {

    if(error.code === 11000) throw new BadRequestException("Ya existe ese gasto");

    this.logger.error(error);
    throw new InternalServerErrorException("revisa el logs");

  }
}
