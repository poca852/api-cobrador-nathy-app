import { Body, Controller, Post, Param, Get, Query, Patch } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, UpdateUserDto, CreateUserDto } from './dto';
import { GlobalParams } from 'src/common/dto/global-params.dto';
import { Auth, GetUser } from './decorators';
import { ValidRoles } from './interfaces';
import { User } from './entities/user.entity';
import convertirFechaStringAFechaObjeto from 'src/common/helpers/stringToDate';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Auth(ValidRoles.admin, ValidRoles.superAdmin)
  @Post("new-user")
  async create(
    @Body() createUserDto: CreateUserDto
  ){
    return this.authService.create(createUserDto)
  }

  @Post("login")
  async login(
    @Body() loginDto: LoginDto,
  ) {

    return this.authService.login(loginDto);
    
  }

  @Auth()
  @Get("users")
  async findAll(
    @GetUser() user: User
  ) {
    return this.authService.findAll(user)
  }

  @Auth()
  @Get("revalidar")
  async checkStatus(
    @GetUser() user: User
  ) {
    return this.authService.checkStatus(user)
  }

  @Auth()
  @Get("user/:termino")
  async findOne(
    @Param("termino") termino: string
  ) {
    return this.authService.findOne(termino)
  }

  @Auth(ValidRoles.admin, ValidRoles.superAdmin)
  @Patch("update-user/:id")
  async update(
    @Param("id") id: string,
    @Body() updateUserDto: UpdateUserDto
  ) {
    return this.authService.update(id, updateUserDto)
  }
}
