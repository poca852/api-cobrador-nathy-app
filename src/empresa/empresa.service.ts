import { Injectable, Logger, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Empresa } from './entities/empresa.entity';
import { Model } from 'mongoose';

@Injectable()
export class EmpresaService {

  private logger = new Logger("EmpresaService");

  constructor(
    @InjectModel(Empresa.name)
    private readonly empresaModel: Model<Empresa>
  ){}

  async create(createEmpresaDto: CreateEmpresaDto) {
    
    try {
      
      const empresa = new this.empresaModel(createEmpresaDto);

      await empresa.save();

      return empresa;

    } catch (error) {
      this.handleExceptions(error);
    }

  }

  async findAll() {
    return await this.empresaModel.find();
  }

  async findOne(id: string) {
    
    const empresa = await this.empresaModel.findById(id)

    if(!empresa) {
      throw new NotFoundException(`Empresa con el id ${id} no existe`)
    }

    return empresa;

  }

  async update(id: string, updateEmpresaDto: UpdateEmpresaDto) {
    
    const empresa = await this.findOne(id);
    
    try {

      await empresa.updateOne(updateEmpresaDto, {new: true});

      return true;
      
    } catch (error) {
      this.handleExceptions(error);
    }
    

  }

  remove(id: number) {
    return `This action removes a #${id} empresa`;
  }

  private handleExceptions(error: any) {

    if(error.code === 11000){
      throw new BadRequestException("Ya existe esta Empresa");
    }

    this.logger.error(error);
    throw new InternalServerErrorException("Por favor revisa el console.log");

  }
}
