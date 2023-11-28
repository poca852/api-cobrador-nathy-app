import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { EmpresaService } from './empresa.service';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { ParseMongoIdPipe } from 'src/common/pipes/parse-mongo-id.pipe';
import { Auth } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/interfaces';

@Auth()
@Controller('empresa')
export class EmpresaController {
  constructor(private readonly empresaService: EmpresaService) {}

  @Post()
  create(@Body() createEmpresaDto: CreateEmpresaDto) {
    return this.empresaService.create(createEmpresaDto);
  }

  // ! TRAE LOS EMPLEADOS SEGUN LA EMPRESA
  @Get('get-empleados')
  findAll(
    @Query('empresa', ParseMongoIdPipe) empresa: string
  ) {
    return this.empresaService.findAll(empresa);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseMongoIdPipe) id: string
  ) {
    return this.empresaService.findOne(id);
  }

  @Patch('update/:id')
  update(
    @Param('id', ParseMongoIdPipe) id: string, 
    @Body() updateEmpresaDto: UpdateEmpresaDto
  ) {
    return this.empresaService.update(id, updateEmpresaDto);
  }

  @Auth(ValidRoles.admin, ValidRoles.superAdmin)
  @Patch('add-empleado')
  addEmploye(
    @Query('empresa', ParseMongoIdPipe) empresa: string,
    @Query('empleado', ParseMongoIdPipe) empleado: string
  ){
    return this.empresaService.addEmploye(empresa, empleado);
  }

  @Auth(ValidRoles.admin, ValidRoles.superAdmin)
  @Patch('add-ruta')
  addRuta(
    @Query('empresa', ParseMongoIdPipe) empresa: string,
    @Query('ruta', ParseMongoIdPipe) ruta: string
  ) {
    return this.empresaService.addRuta(empresa, ruta)
  }

  @Patch('add-owner')
  addOwner(
    @Query('empresa', ParseMongoIdPipe) empresa: string,
    @Query('user', ParseMongoIdPipe) user: string,
  ) {
    return this.empresaService.addOwner(empresa, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.empresaService.remove(+id);
  }
}
