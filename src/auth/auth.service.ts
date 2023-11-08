import { Injectable, UnauthorizedException, Logger, BadRequestException, InternalServerErrorException, NotFoundException, forwardRef, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from "bcrypt";
import { CreateUserDto, LoginDto } from './dto';
import { User } from './entities/user.entity';
import { JwtPayload } from './interfaces';
import { LoginResponse } from './interfaces/login-response.interface';
import { UpdateUserDto } from './dto/update-user.dto';
import { RutaService } from '../ruta/ruta.service';
import { CierreCaja } from '../caja/entities/cierre_caja.entity';
import { LogAuth } from 'src/log-auth/entities/log-auth.entity';

@Injectable()
export class AuthService {

   private logger = new Logger("AuthService");

   constructor(
      @InjectModel(User.name)
      private readonly userModel: Model<User>,
      private readonly jwtService: JwtService,

      @Inject(forwardRef(() => RutaService))
      private readonly rutaService: RutaService,

      @InjectModel(CierreCaja.name)
      private readonly CcModel: Model<CierreCaja>,

      @InjectModel(LogAuth.name)
      private readonly logAuth: Model<LogAuth>
   ) { }

   async create(createUserDto: CreateUserDto): Promise<User> {

      try {

         const user = new this.userModel(createUserDto);
         user.password = bcrypt.hashSync(createUserDto.password, 10);

         await user.save();

         return user;

      } catch (error) {
         this.handleExceptions(error);
      }

   }

   async login(loginDto: LoginDto): Promise<LoginResponse> {

      const { username, password } = loginDto;
      const user = await this.userModel.findOne({
         username: username.toUpperCase()
      })
         .populate({
            path: "rol",
            select: "rol"
         })
         .populate({
            path: "ruta"
         })
         .populate("empresa")

      if (!user) {
         throw new UnauthorizedException("Datos Incorrectos");
      }

      if (!bcrypt.compareSync(password, user.password)) {

         // crear log de autenticacion
         await this.logAuth.create({
            user: user._id,
            isSuccessful: false,
            reason: "Contraseña Incorrecta"
         })

         throw new UnauthorizedException("Datos Incorrectos")
      }

      if(user.ruta) {
         if (!user.ruta.status) {
            // crear log de autenticacion
            await this.logAuth.create({
               user: user._id,
               isSuccessful: false,
               reason: "Ruta Cerrada"
            })
   
            throw new UnauthorizedException("Ruta cerrada hable con su administrador")
         }
      }

      for (const ruta of user.rutas) {
         await this.rutaService.actualizarRuta(ruta);
      }

      const { password: _, ...rest } = user.toJSON();

      await this.logAuth.create({
         user: user._id,
         isSuccessful: true,
         reason: "Autenticacion Exitosa"
      });

      return {
         user: rest,
         token: this.getJwtToken({ id: user._id.toString() })
      }


   }

   async checkStatus(user: User): Promise<LoginResponse> {
      return {
         user,
         token: this.getJwtToken({ id: user._id })
      }

   }

   async verificarSiCerroRuta(idRuta: string, fecha: Date): Promise<boolean> {

      fecha.setDate(fecha.getDate() - 1);
      const cierreDeCaja = await this.CcModel.findOne({
         ruta: idRuta,
         date: fecha.toLocaleDateString('es')
      });

      return !!cierreDeCaja;

   }

   async findAll(user: User) {

      let empleados = [];

      for (const ruta of user.rutas) {
         let consulta = await this.userModel.find({ ruta: ruta._id })
            .populate('ruta', ['nombre'])
            .populate('rol', ['rol'])

         empleados.push(...consulta)
      }


      return empleados;

   }

   async findOne(termino: string) {

      let user: User;

      if (isValidObjectId(termino)) {
         user = await this.userModel.findById(termino)
            .populate({
               path: "rol",
               select: "rol"
            })
            .populate("rutas")
            .select("-password")
      }

      if (!user) {
         const regex = new RegExp(termino.trim().toUpperCase(), "i");
         user = await this.userModel.findOne({
            $or: [{ nombre: regex }, { username: regex }],
         })
            .populate({
               path: "rol",
               select: "rol"
            })
            .select("-password");
      }


      if (!user) {
         throw new NotFoundException(`No existe un usuario con el termino ${termino}`)
      }

      return user;
   }

   async update(id: string, updateUserDto: UpdateUserDto) {

      const user = await this.userModel.findById(id)

      if (!user) {
         throw new NotFoundException(`No existe un usuario con el id ${id}`)
      }


      if (updateUserDto.password) {
         updateUserDto.password = bcrypt.hashSync(updateUserDto.password, 10);
      } else {
         delete updateUserDto.password;
      }

      try {
         await user.updateOne(updateUserDto, { new: true });

         return {
            ...user.toJSON(),
            ...updateUserDto
         }
      } catch (error) {
         this.handleExceptions(error)
      }

   }

   private getJwtToken(payload: JwtPayload): string {
      const token = this.jwtService.sign(payload);
      return token;
   }

   private handleExceptions(error: any) {
      if (error.code === 11000) {
         throw new BadRequestException(`Ya existe un usuario ${JSON.stringify(error.keyValue)}`);
      }

      this.logger.error(error);
      throw new InternalServerErrorException("Revisar el console.log")
   }

}
