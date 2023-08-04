import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CajaService } from './caja.service';
import { CreateCajaDto } from './dto/create-caja.dto';
import { UpdateCajaDto } from './dto/update-caja.dto';
import { Auth } from 'src/auth/decorators';
import { ParseMongoIdPipe } from 'src/common/pipes/parse-mongo-id.pipe';
import { GlobalParams } from '../common/dto/global-params.dto';

@Auth()
@Controller('caja')
export class CajaController {
  constructor(private readonly cajaService: CajaService) {}

  @Post()
  create(@Body() createCajaDto: CreateCajaDto) {
    return this.cajaService.create(createCajaDto);
  }

  @Get()
  findAll() {
    return this.cajaService.findAll();
  }

  @Get(":id")
  async findOne(
    @Param("id", ParseMongoIdPipe) id: string,
  ) {
    return this.cajaService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCajaDto: UpdateCajaDto) {
    return this.cajaService.update(+id, updateCajaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cajaService.remove(+id);
  }
}
