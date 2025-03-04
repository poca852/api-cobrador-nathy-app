import { Injectable, Logger, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Empresa } from './entities/empresa.entity';
import { Model } from 'mongoose';
import { User } from '../auth/entities/user.entity';
import { RutaService } from '../ruta/ruta.service';
import { AuthService } from '../auth/auth.service';
import { CreateUserDto } from '../auth/dto/create-user.dto';
import { ClienteService } from '../cliente/cliente.service';
import { CronJob } from 'cron';

@Injectable()
export class EmpresaService {

  private logger = new Logger("EmpresaService");

  constructor(
    @InjectModel(Empresa.name)
    private readonly empresaModel: Model<Empresa>,

    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    private rutaSvc: RutaService,

    private authSvc: AuthService,
    private clienteSrc: ClienteService,
  ) {
    const closeRutas = CronJob.from({
      cronTime: '00 00 4 * * 1-7',
      onTick: this.rutaSvc.checkRutas,
      start: true,
      timeZone: 'America/sao_paulo'
    });
        
    const openRutas = CronJob.from({
      cronTime: '00 00 9 * * 1-6',
      onTick: this.rutaSvc.checkOpenRutas,
      start: true,
      timeZone: 'America/sao_paulo'
    });
  }

  async create(createEmpresaDto: CreateEmpresaDto) {

    try {

      const empresa = new this.empresaModel(createEmpresaDto);

      await empresa.save();

      return empresa;

    } catch (error) {
      this.handleExceptions(error);
    }

  }
  
  async getEmpresaById(id: string) {

    try {

      const empresa = await this.empresaModel.findById(id)
        .populate('employes')
        .populate('rutas');
    
      return empresa;

    } catch (error) {
      
      this.handleExceptions(error);

    }

  }

  mundo() {
    this.findEmpresaWithRutasOpened().then(console.log)
  }

  async findEmpresaWithRutasOpened() {

    try {
      const empresasConRutasAbiertas = await this.empresaModel.aggregate([
        {
          $lookup: {
            from: 'rutas', // Nombre de la colección de rutas en la base de datos
            localField: 'rutas',
            foreignField: '_id',
            as: 'rutas',
          },
        },
        {
          $unwind: '$rutas',
        },
        {
          $match: {
            'rutas.status': true,
          },
        },
        {
          $group: {
            _id: '$_id',
            nombre: { $first: '$name' },
            email: { $first: '$email' },
            phone: { $first: '$phone' },
            rutas: { $push: '$rutas.nombre' },
          },
        },
      ]);

      return empresasConRutasAbiertas;
    } catch (error) {
      console.error('Error al obtener empresas con rutas abiertas:', error);
      throw error;
    }

  }

  async findAll(empresa: string) {

    let empresaDB = await this.empresaModel.findById(empresa)
      .populate([
        {
          path: 'employes',
          populate: {
            path: 'ruta'
          }
        },
        {
          path: 'rutas'
        }
      ])

    empresaDB = empresaDB.toObject();
    return empresaDB.employes;

  }

  async getClientes(idEmpresa: string) {

    const empresa = await this.empresaModel.findById(idEmpresa)

  }

  async findRutasByEmpresa(idEmpresa: string) {
    
    const empresa = await this.empresaModel.findById(idEmpresa)
      .populate('rutas');

    return empresa.rutas;
    
  }

  async findOne(id: string) {

    const empresa = await this.empresaModel.findById(id)
      .populate([
        {
          path: 'employes'
        },
        {
          path: 'rutas',
          populate: [
            { path: 'caja_actual' },
            { path: 'ultima_caja' },
          ]
        }
      ])

    if (!empresa) {
      throw new NotFoundException(`Empresa con el id ${id} no existe`)
    }

    return empresa;

  }

  async update(id: string, updateEmpresaDto: UpdateEmpresaDto) {

    const empresa = await this.findOne(id);

    try {

      await empresa.updateOne(updateEmpresaDto, { new: true });

      return true;

    } catch (error) {
      this.handleExceptions(error);
    }


  }

  async addEmploye(userDto: CreateUserDto) {

    try {

      const empresa = await this.empresaModel.findById(userDto.empresa).populate('employes');
      const empleado = await this.authSvc.create(userDto);

      const existeEmpleado = empresa.employes.some(e => e._id.equals(empleado._id));

      if (!existeEmpleado) {

        empresa.employes.push(empleado);
        await empresa.save();

        empleado.empresa = empresa._id;
        await empleado.save();

      } else {
        throw new BadRequestException('El empleado ya esta en esta empresa')
      }

    }catch (error) {

      this.handleExceptions(error)

    }

    return true;
  }

  async deleteEmpleado(idEmpresa: string, empleado: string) {

    const user = await this.userModel.findById(empleado);
    if (!user) throw new NotFoundException('No existe el usuario');
    const empresa = await this.empresaModel.findById(idEmpresa);
    if (!empresa) throw new NotFoundException('No existe la empresa');

    try {
      empresa.employes = empresa.employes.filter(empId => !empId.equals(user._id));
      await empresa.save();
      await this.userModel.findByIdAndDelete(empleado);
    } catch (error) {
      this.handleExceptions(error)
    }

    return true;

  }


  async addRuta(idEmpresa: string, idRuta: string) {

    const empresa = await this.empresaModel.findById(idEmpresa).populate('rutas');
    const ruta = await this.rutaSvc.findOne(idRuta);

    if (!empresa) {
      throw new NotFoundException('La empresa no existe');
    }

    const existeRuta = empresa.rutas.some(r => r._id.equals(ruta._id));

    if (!existeRuta) {
      try {
        empresa.rutas.push(ruta);
        await empresa.save();
        ruta.empresa = empresa._id;
        await ruta.save()
      } catch (error) {
        console.error('Error al guardar en la base de datos:', error);
        throw new Error('Error al guardar en la base de datos');
      }
    } else {
      throw new BadRequestException('La ruta ya esta en esta empresa')
    }

    return true;


  }

  async addOwner(idEmpresa: string, user: string) {
    const empresa = await this.findOne(idEmpresa);
    const owner = await this.userModel.findById(user)

    if (!owner) throw new NotFoundException('El usuario no existe');

    try {

      empresa.owner = owner._id;
      owner.empresa = empresa._id;
      await empresa.save();
      await owner.save();
      return true;

    } catch (error) {
      this.handleExceptions(error)
    }

  }

  remove(id: number) {
    return `This action removes a #${id} empresa`;
  }


  private handleExceptions(error: any) {

    if (error.code === 11000) {
      throw new BadRequestException("Ya existe esta Empresa");
    }

    this.logger.error(error);
    throw new InternalServerErrorException("Por favor revisa el console.log");

  }

  async openOrCloseRuta(idEmpresa: string, idRuta: string, action: string){

    const empresa = await this.empresaModel.findById(idEmpresa)
      .select('rutas')
      .populate({
        path: 'rutas',
        select: '_id'
      })

    const { _id: ruta} = empresa.rutas.find(ruta => ruta._id.toString() === idRuta);

    const validAction = ['CLOSE', 'OPEN'];

    const actionHandlers = {
      CLOSE: () => this.rutaSvc.closeRuta(ruta),
      OPEN: () => this.rutaSvc.openRuta(ruta)
    }

    if(!validAction.includes(action)){
      throw new BadRequestException('Ingrese una accion valida');
    }

    await actionHandlers[action]();

  }

}
