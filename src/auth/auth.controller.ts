import { Body, Controller, Post, Param, Get, Query, Patch } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginDto } from './dto';
import { GlobalParams } from 'src/common/dto/global-params.dto';
import { Auth } from './decorators';
import { ValidRoles } from './interfaces';
import { UpdateUserDto } from './dto/update-user.dto';

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
    @Body()
    loginDto: LoginDto
  ) {
    return this.authService.login(loginDto)
  }

  @Auth()
  @Get("users")
  async findAll(
    @Query() globalParams: GlobalParams
  ) {
    return this.authService.findAll(globalParams)
  }

  @Auth()
  @Get("user/:termino")
  async findOne(
    @Query() globalParams: GlobalParams,
    @Param("termino") termino: string
  ) {
    return this.authService.findOne(termino, globalParams)
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
