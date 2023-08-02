import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ListGastoService } from './list-gasto.service';
import { CreateListGastoDto } from './dto/create-list-gasto.dto';
import { UpdateListGastoDto } from './dto/update-list-gasto.dto';
import { Auth } from 'src/auth/decorators';
import { ParseMongoIdPipe } from 'src/common/pipes/parse-mongo-id.pipe';

@Auth()
@Controller('list-gasto')
export class ListGastoController {
  constructor(private readonly listGastoService: ListGastoService) {}

  @Post()
  async create(
    @Body() createListGastoDto: CreateListGastoDto
  ) {
    return this.listGastoService.create(createListGastoDto);
  }

  @Get()
  async findAll() {
    return this.listGastoService.findAll();
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseMongoIdPipe) id: string
  ) {
    return this.listGastoService.findOne(id);
  }
}
