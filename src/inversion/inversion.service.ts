import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { CreateInversionDto } from './dto/create-inversion.dto';
import { UpdateInversionDto } from './dto/update-inversion.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Inversion } from './entities/inversion.entity';
import { Model } from 'mongoose';

@Injectable()
export class InversionService {

  private logger = new Logger("InversionService");

  constructor(
    @InjectModel(Inversion.name)
    private readonly inversionModel: Model<Inversion>
  ){}

  async create(createInversionDto: CreateInversionDto) {
    try {
      
      return this.inversionModel.create(createInversionDto);

    } catch (error) {

      this.handleExceptions(error)

    }
  }

  findAll() {
    return `This action returns all inversion`;
  }

  findOne(id: number) {
    return `This action returns a #${id} inversion`;
  }

  update(id: number, updateInversionDto: UpdateInversionDto) {
    return `This action updates a #${id} inversion`;
  }

  remove(id: number) {
    return `This action removes a #${id} inversion`;
  }

  private handleExceptions(error: any) {
    this.logger.error(error);
    throw new InternalServerErrorException("Por favor revisa los logs")
  }
}
