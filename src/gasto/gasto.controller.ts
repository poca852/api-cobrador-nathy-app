import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { GastoService } from './gasto.service';
import { CreateGastoDto } from './dto/create-gasto.dto';
import { UpdateGastoDto } from './dto/update-gasto.dto';
import { Auth } from 'src/auth/decorators';
import { GlobalParams } from 'src/common/dto/global-params.dto';

@Auth()
@Controller('gasto')
export class GastoController {
  constructor(private readonly gastoService: GastoService) {}

  @Post()
  async create(
    @Body() createGastoDto: CreateGastoDto
  ) {
    return this.gastoService.create(createGastoDto);
  }

  @Get()
  findAll() {
    return this.gastoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gastoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGastoDto: UpdateGastoDto) {
    return this.gastoService.update(+id, updateGastoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.gastoService.remove(+id);
  }
}
