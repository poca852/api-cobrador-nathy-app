import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PagoService } from './pago.service';
import { CreatePagoDto } from './dto/create-pago.dto';
import { UpdatePagoDto } from './dto/update-pago.dto';
import { Auth } from 'src/auth/decorators';
import { ParseMongoIdPipe } from 'src/common/pipes/parse-mongo-id.pipe';
import { GlobalParams } from '../common/dto/global-params.dto';

@Auth()
@Controller('pago')
export class PagoController {
  constructor(private readonly pagoService: PagoService) {}

  @Post()
  async create(
    @Body() createPagoDto: CreatePagoDto,
    @Query('fecha') fecha: string
  ) {
    return this.pagoService.create(createPagoDto, fecha);
  }

  @Get()
  async findAll(
    @Query('fecha') fecha: string,
    @Query('ruta') ruta: string,
  ) {
    return this.pagoService.findAll(fecha, ruta);
  }

  @Get(':id')
  async findOne(@Param('id', ParseMongoIdPipe) id: string) {
    return this.pagoService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseMongoIdPipe) id: string, 
    @Body() updatePagoDto: UpdatePagoDto
  ) {
    return this.pagoService.update(id, updatePagoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pagoService.remove(+id);
  }
}
