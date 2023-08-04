import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ClienteService } from './cliente.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { GlobalParams } from 'src/common/dto/global-params.dto';
import { ParseMongoIdPipe } from 'src/common/pipes/parse-mongo-id.pipe';

@Auth()
@Controller('cliente')
export class ClienteController {
  constructor(private readonly clienteService: ClienteService) {}

  @Post()
  async create(
    @Body() createClienteDto: CreateClienteDto
  ) {
    return this.clienteService.create(createClienteDto);
  }

  @Get()
  async findAll(
    @Query() globalParams: GlobalParams
  ) {
    return this.clienteService.findAll(globalParams);
  }

  @Get(':termino')
  async findOne(
    @Param('termino') termino: string,
  ) {
    return this.clienteService.findOne(termino);
  }

  @Patch(':id')
  update(
    @Param('id', ParseMongoIdPipe) id: string, 
    @Body() updateClienteDto: UpdateClienteDto
  ) {
    return this.clienteService.update(id, updateClienteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clienteService.remove(+id);
  }
}
