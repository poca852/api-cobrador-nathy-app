import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { EmpresaService } from './empresa.service';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { ParseMongoIdPipe } from 'src/common/pipes/parse-mongo-id.pipe';
import { Auth } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/interfaces';
import { CreateUserDto } from 'src/auth/dto';

@Controller('empresa')
export class EmpresaController {
  constructor(private readonly empresaService: EmpresaService) {}

  @Auth()
  @Post()
  create(@Body() createEmpresaDto: CreateEmpresaDto) {
    return this.empresaService.create(createEmpresaDto);
  }

  // ! TRAE LOS EMPLEADOS SEGUN LA EMPRESA
  @Auth()
  @Get('get-empleados')
  findAll(
    @Query('empresa', ParseMongoIdPipe) empresa: string
  ) {
    return this.empresaService.findAll(empresa);
  }

  @Get('get-open-rutas')
  findEmpresaWithRutasOpened(){
    return this.empresaService.findEmpresaWithRutasOpened()
  }

  @Auth()
  @Get(':id')
  findOne(
    @Param('id', ParseMongoIdPipe) id: string
  ) {
    return this.empresaService.findOne(id);
  }

  @Auth()
  @Patch('update/:id')
  update(
    @Param('id', ParseMongoIdPipe) id: string, 
    @Body() updateEmpresaDto: UpdateEmpresaDto
  ) {
    return this.empresaService.update(id, updateEmpresaDto);
  }

  @Auth(ValidRoles.admin, ValidRoles.superAdmin)
  @Post('add-empleado')
  addEmploye(
    @Body() userDto: CreateUserDto,
  ){
    return this.empresaService.addEmploye(userDto);
  }

  @Auth(ValidRoles.admin, ValidRoles.superAdmin)
  @Delete('remove-empleado')
  removeEmploye(
    @Query('empresa', ParseMongoIdPipe) empresa: string,
    @Query('empleado', ParseMongoIdPipe) empleado: string
  ){
    return this.empresaService.deleteEmpleado(empresa, empleado);
  }

  @Auth(ValidRoles.admin, ValidRoles.superAdmin)
  @Patch('add-ruta')
  addRuta(
    @Query('empresa', ParseMongoIdPipe) empresa: string,
    @Query('ruta', ParseMongoIdPipe) ruta: string
  ) {
    return this.empresaService.addRuta(empresa, ruta)
  }

  @Auth()
  @Patch('add-owner')
  addOwner(
    @Query('empresa', ParseMongoIdPipe) empresa: string,
    @Query('user', ParseMongoIdPipe) user: string,
  ) {
    return this.empresaService.addOwner(empresa, user);
  }

  @Auth()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.empresaService.remove(+id);
  }
}
