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
import { MomentService } from 'src/common/plugins/moment/moment.service';
import { Request } from 'express';
import { MessageGateway } from '../message/message.gateway';

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
      private readonly logAuth: Model<LogAuth>,

      private moment: MomentService
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

   async login(loginDto: LoginDto, request: Request): Promise<LoginResponse> {

      const { username, password } = loginDto;

      let user = await this.userModel.findOne({
         username: username.toUpperCase()
      })
         .populate({
            path: "ruta"
         })
      
      if (!user) {

         await this.logAuth.create({
            ipAddress: request.ip,
            userAgent: request.headers['user-agent'],
            reason: 'User does not exist',
            isSuccessful: false
         })

         throw new UnauthorizedException("Datos Incorrectos");
      }

      if (!bcrypt.compareSync(password, user.password)) {

         await this.logAuth.create({
            user: user._id,
            ipAddress: request.ip,
            userAgent: request.headers['user-agent'],
            reason: 'Incorrect credentials',
            isSuccessful: false
         })

         throw new UnauthorizedException("Datos Incorrectos")
      }

      if(user.ruta  && user.rol === 'COBRADOR') {
         if (!user.ruta.status) {   

            await this.logAuth.create({
               user: user._id,
               ipAddress: request.ip,
               userAgent: request.headers['user-agent'],
               reason: 'Ruta cerrada',
               isSuccessful: false
            })

            throw new UnauthorizedException("Ruta cerrada hable con su administrador")
         }

         if(user.ruta.isLocked) {

            await this.logAuth.create({
               user: user._id,
               ipAddress: request.ip,
               userAgent: request.headers['user-agent'],
               reason: 'Ruta bloqueada',
               isSuccessful: false
            })

            throw new UnauthorizedException('Su ruta se encuentra bloqueada, por favor ponganse en contacto con su supervisor')
         }
      }

      user = user.toObject();
      delete user.password;
      delete user.__v;

      return {
         user,
         token: this.getJwtToken({ id: user._id.toString() })
      }


   }

   async checkStatus(user: User): Promise<LoginResponse> {

      const userDB = await this.userModel.findById(user._id)
         .populate({
            path: "ruta"
         })

      if(userDB.ruta.isLocked) {
         throw new UnauthorizedException("Ruta bloqueada")
      }

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

   async findAll(user: User, have_empresa: boolean = true) {
      if(!have_empresa){
         return this.userModel.find({
            empresa: { $in: [null, undefined] }
         })
      }

      let empleados = [];

      // for (const ruta of user.rutas) {
      //    let consulta = await this.userModel.find({ ruta: ruta._id });

      //    empleados.push(...consulta)
      // }

      const users = await this.userModel.find();
      return users.filter(userDb => userDb._id.toString() !== user._id.toString());

   }

   async findOne(termino: string) {

      let user: User;

      if (isValidObjectId(termino)) {
         user = await this.userModel.findById(termino)
            .populate('ruta')
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


      if (!!updateUserDto.password) {
         if(updateUserDto.password.length < 6) {
            throw new BadRequestException(`La contraseña tiene que tener minimo 6 caracteres`)
         }
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

   public async deleteUser(id: string): Promise<string> {
      try {

         await this.userModel.findByIdAndDelete(id);
         return id;

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
