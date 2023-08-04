import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { CreateRetiroDto } from './dto/create-retiro.dto';
import { UpdateRetiroDto } from './dto/update-retiro.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Retiro } from './entities/retiro.entity';
import { Model } from 'mongoose';

@Injectable()
export class RetiroService {

  private logger = new Logger("RetiroService");

  constructor(
    @InjectModel(Retiro.name)
    private retiroModel: Model<Retiro>
  ){}

  async create(createRetiroDto: CreateRetiroDto): Promise<Retiro> {
    try {

      return await this.retiroModel.create(createRetiroDto);
      
    } catch (error) {

      this.handleExceptions(error);

    }
  }

  findAll() {
    return `This action returns all retiro`;
  }

  findOne(id: number) {
    return `This action returns a #${id} retiro`;
  }

  update(id: number, updateRetiroDto: UpdateRetiroDto) {
    return `This action updates a #${id} retiro`;
  }

  remove(id: number) {
    return `This action removes a #${id} retiro`;
  }

  private handleExceptions(error: any) {
    this.logger.error(error);
    throw new InternalServerErrorException("Por favor revisa los logs")
  }
}
