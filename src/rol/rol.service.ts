import { Injectable } from '@nestjs/common';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Rol } from './entities/rol.entity';
import { Model } from 'mongoose';

@Injectable()
export class RolService {

  constructor(
    @InjectModel(Rol.name)
    private readonly rolModel: Model<Rol>
  ){}

  create(createRolDto: CreateRolDto) {
    return 'This action adds a new rol';
  }

  async findAll() {
    return await this.rolModel.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} rol`;
  }

  update(id: number, updateRolDto: UpdateRolDto) {
    return `This action updates a #${id} rol`;
  }

  remove(id: number) {
    return `This action removes a #${id} rol`;
  }
}
