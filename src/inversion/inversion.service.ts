import { Injectable } from '@nestjs/common';
import { CreateInversionDto } from './dto/create-inversion.dto';
import { UpdateInversionDto } from './dto/update-inversion.dto';

@Injectable()
export class InversionService {
  create(createInversionDto: CreateInversionDto) {
    return 'This action adds a new inversion';
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
}
