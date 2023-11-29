import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { InversionService } from './inversion.service';
import { CreateInversionDto } from './dto/create-inversion.dto';
import { UpdateInversionDto } from './dto/update-inversion.dto';
import { Auth } from 'src/auth/decorators';
import { ParseMongoIdPipe } from 'src/common/pipes/parse-mongo-id.pipe';

@Auth()
@Controller('inversion')
export class InversionController {
  constructor(private readonly inversionService: InversionService) {}

  @Post()
  async create(
    @Body() createInversionDto: CreateInversionDto
  ) {
    return this.inversionService.create(createInversionDto);
  }

  @Get()
  findAll() {
    return this.inversionService.findAll();
  }

  @Get('get-by-date')
  findByDate(
    @Query('fecha') fecha: string,
    @Query('ruta', ParseMongoIdPipe) ruta: string,
  ) {
    return this.inversionService.findByDate(fecha, ruta);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inversionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInversionDto: UpdateInversionDto) {
    return this.inversionService.update(+id, updateInversionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.inversionService.remove(+id);
  }
}
