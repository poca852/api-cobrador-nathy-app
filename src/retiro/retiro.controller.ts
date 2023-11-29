import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { RetiroService } from './retiro.service';
import { CreateRetiroDto } from './dto/create-retiro.dto';
import { UpdateRetiroDto } from './dto/update-retiro.dto';
import { Auth } from 'src/auth/decorators';
import { ParseMongoIdPipe } from 'src/common/pipes/parse-mongo-id.pipe';

@Auth()
@Controller('retiro')
export class RetiroController {
  constructor(private readonly retiroService: RetiroService) {}

  @Post()
  async create(
    @Body() createRetiroDto: CreateRetiroDto
  ) {
    return this.retiroService.create(createRetiroDto);
  }

  @Get()
  findAll() {
    return this.retiroService.findAll();
  }

  @Get('get-by-date')
  findByDate(
    @Query('fecha') fecha: string,
    @Query('ruta', ParseMongoIdPipe) ruta: string,
  ) {
    return this.retiroService.findByDate(fecha, ruta);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.retiroService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRetiroDto: UpdateRetiroDto) {
    return this.retiroService.update(+id, updateRetiroDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.retiroService.remove(+id);
  }
}
