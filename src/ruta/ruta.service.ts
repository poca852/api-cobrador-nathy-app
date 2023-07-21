import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRutaDto } from './dto/create-ruta.dto';
import { UpdateRutaDto } from './dto/update-ruta.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Ruta } from './entities/ruta.entity';
import { Model, isValidObjectId } from 'mongoose';

@Injectable()
export class RutaService {

  constructor(
    @InjectModel(Ruta.name)
    private readonly rutaModel: Model<Ruta>
  ){}

  create(createRutaDto: CreateRutaDto) {
    return 'This action adds a new ruta';
  }

  async findAll(): Promise<Ruta[]> {
    return await this.rutaModel.find();
  }

  async findOne(termino: string): Promise<Ruta> {
    
    let ruta: Ruta;

    if(isValidObjectId(termino)){
      ruta = await this.rutaModel.findById(termino);
    }

    if(!ruta){
      ruta = await this.rutaModel.findOne({nombre: termino.trim().toUpperCase()})
    }

    if(!ruta){
      throw new NotFoundException(`No existe la ruta ${termino}`);
    }

    return ruta;

  }

  async update(id: string, updateRutaDto: UpdateRutaDto) {
    
    const ruta = await this.findOne(id);

    await ruta.updateOne(updateRutaDto, {new: true});

    return {
      ...ruta.toJSON(),
      ...updateRutaDto
    }

  }
}
