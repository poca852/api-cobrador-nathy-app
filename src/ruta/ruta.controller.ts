import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RutaService } from './ruta.service';
import { CreateRutaDto } from './dto/create-ruta.dto';
import { UpdateRutaDto } from './dto/update-ruta.dto';
import { Auth } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/interfaces';
import { ParseMongoIdPipe } from '../common/pipes/parse-mongo-id.pipe';

@Auth()
@Controller('ruta')
export class RutaController {
  constructor(private readonly rutaService: RutaService) {}

  @Post()
  create(@Body() createRutaDto: CreateRutaDto) {
    return this.rutaService.create(createRutaDto);
  }

  @Get()
  async findAll() {
    return this.rutaService.findAll();
  }


  @Get(':termino')
  async findOne(
    @Param('termino') termino: string
  ) {
    return this.rutaService.findOne(termino);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseMongoIdPipe) id: string, 
    @Body() updateRutaDto: UpdateRutaDto
  ) {
    return this.rutaService.update(id, updateRutaDto);
  }

}
