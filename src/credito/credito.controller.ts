import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CreditoService } from './credito.service';
import { CreateCreditoDto } from './dto/create-credito.dto';
import { UpdateCreditoDto } from './dto/update-credito.dto';
import { Auth } from '../auth/decorators';
import { GlobalParams } from '../common/dto/global-params.dto';
import { ParseMongoIdPipe } from 'src/common/pipes/parse-mongo-id.pipe';

@Auth()
@Controller('credito')
export class CreditoController {
  constructor(private readonly creditoService: CreditoService) {}

  @Post()
  create(@Body() createCreditoDto: CreateCreditoDto) {
    return this.creditoService.create(createCreditoDto);
  }

  @Get()
  async findAll(
    @Query() globalParams: GlobalParams
  ) {
    return this.creditoService.findAll(globalParams);
  }

  @Get(':id')
  async findOne(@Param('id', ParseMongoIdPipe) id: string) {
    return this.creditoService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateCreditoDto: UpdateCreditoDto) {
    return await this.creditoService.update(id, updateCreditoDto);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseMongoIdPipe) id: string,
  ) {
    return this.creditoService.remove(id);
  }
}
