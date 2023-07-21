import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ListGastoService } from './list-gasto.service';
import { CreateListGastoDto } from './dto/create-list-gasto.dto';
import { UpdateListGastoDto } from './dto/update-list-gasto.dto';

@Controller('list-gasto')
export class ListGastoController {
  constructor(private readonly listGastoService: ListGastoService) {}

  @Post()
  create(@Body() createListGastoDto: CreateListGastoDto) {
    return this.listGastoService.create(createListGastoDto);
  }

  @Get()
  findAll() {
    return this.listGastoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.listGastoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateListGastoDto: UpdateListGastoDto) {
    return this.listGastoService.update(+id, updateListGastoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.listGastoService.remove(+id);
  }
}
