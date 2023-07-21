import { Injectable } from '@nestjs/common';
import { CreateListGastoDto } from './dto/create-list-gasto.dto';
import { UpdateListGastoDto } from './dto/update-list-gasto.dto';

@Injectable()
export class ListGastoService {
  create(createListGastoDto: CreateListGastoDto) {
    return 'This action adds a new listGasto';
  }

  findAll() {
    return `This action returns all listGasto`;
  }

  findOne(id: number) {
    return `This action returns a #${id} listGasto`;
  }

  update(id: number, updateListGastoDto: UpdateListGastoDto) {
    return `This action updates a #${id} listGasto`;
  }

  remove(id: number) {
    return `This action removes a #${id} listGasto`;
  }
}
