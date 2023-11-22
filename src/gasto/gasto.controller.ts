import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { GastoService } from './gasto.service';
import { CreateGastoDto } from './dto/create-gasto.dto';
import { UpdateGastoDto } from './dto/update-gasto.dto';
import { Auth } from 'src/auth/decorators';
import { GlobalParams } from 'src/common/dto/global-params.dto';
import { ParseMongoIdPipe } from 'src/common/pipes/parse-mongo-id.pipe';

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
  async findAll(
    @Query() globalParams: GlobalParams
  ) {
    return this.gastoService.findAll(globalParams);
  }

  @Get("get-by-date")
  async findByDate(
    @Query() globalParams: GlobalParams
  ) {
    return this.gastoService.findByDate(globalParams);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gastoService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseMongoIdPipe) id: string, 
    @Body() updateGastoDto: UpdateGastoDto
  ) {
    return this.gastoService.update(id, updateGastoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.gastoService.remove(+id);
  }
}
