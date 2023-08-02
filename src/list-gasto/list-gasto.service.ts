import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateListGastoDto } from './dto/create-list-gasto.dto';
import { UpdateListGastoDto } from './dto/update-list-gasto.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ListGasto } from './entities/list-gasto.entity';

@Injectable()
export class ListGastoService {

  private logger = new Logger("ListGastoService")

  constructor(
    @InjectModel(ListGasto.name)
    private ListGastoMode: Model<ListGasto>
  ) {}

  async create(createListGastoDto: CreateListGastoDto): Promise<ListGasto> {
    try {
      
      const gasto = await this.ListGastoMode.create(createListGastoDto);

      return gasto

    } catch (error) {
      this.handleExceptions(error)
    }
  }

  async findAll(): Promise<ListGasto[]> {
    return this.ListGastoMode.find()
  }

  async findOne(id: string): Promise<ListGasto> {
    
    const gasto = await this.ListGastoMode.findById(id);

    if(!gasto) throw new NotFoundException("No se encontro ese gasto");

    return gasto;

  }

  private handleExceptions(error: any) {
    if(error.code === 11000) throw new BadRequestException("Ya existe este gasto")

    this.logger.error(error)
    throw new InternalServerErrorException("Por favor revisa los logs")
  }
}
