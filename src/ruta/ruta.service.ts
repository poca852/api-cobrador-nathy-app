import { Injectable, NotFoundException, Logger, BadRequestException, InternalServerErrorException, forwardRef, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateRutaDto } from './dto/create-ruta.dto';
import { UpdateRutaDto } from './dto/update-ruta.dto';
import { Ruta } from './entities/ruta.entity';
import { Model } from 'mongoose';
import { AuthService } from '../auth/auth.service';
import { User } from '../auth/entities/user.entity';
import { Credito } from '../credito/entities/credito.entity';
import { Cliente } from '../cliente/entities/cliente.entity';
import { Inversion } from '../inversion/entities/inversion.entity';
import { Gasto } from '../gasto/entities/gasto.entity';
import { Retiro } from '../retiro/entities/retiro.entity';
import { GlobalParams } from '../common/dto/global-params.dto';
import { Caja } from '../caja/entities/caja.entity';
import { CajaService } from '../caja/caja.service';

@Injectable()
export class RutaService {

  private logger = new Logger("RutaService");

  constructor(
    @InjectModel(Ruta.name)
    private readonly rutaModel: Model<Ruta>,

    @InjectModel(Credito.name)
    private readonly creditoModel: Model<Credito>,

    @InjectModel(Cliente.name)
    private readonly clienteModel: Model<Cliente>,

    @InjectModel(Inversion.name)
    private readonly inversionModel: Model<Inversion>,

    @InjectModel(Gasto.name)
    private readonly gastoModel: Model<Gasto>,

    @InjectModel(Retiro.name)
    private readonly retiroModel: Model<Retiro>,

    @InjectModel(Caja.name)
    private readonly cajaModel: Model<Caja>,

    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,

    @Inject(forwardRef(() => CajaService))
    private readonly cajaService: CajaService
  ){}

  async create(createRutaDto: CreateRutaDto, user: User) {
    
    const admin = await this.authService.findOne(user._id);

    try {

      const ruta = await this.rutaModel.create(createRutaDto); 

      admin.rutas.push(ruta._id);
      await admin.save();

      return ruta;

    } catch (error) {

      this.handleExceptions(error)

    }

  }

  async findAll(user: User): Promise<Ruta[]> {

    let promiseOfRutas: any[] = [];

    user.rutas.forEach(ruta => {
      promiseOfRutas.push(this.rutaModel.findById(ruta));
    })

    let rutas = await Promise.all(promiseOfRutas);

    for (const ruta of rutas) {
      this.actualizarRuta(ruta)
    }
    
    return rutas

  }

  async findOne(id: string): Promise<Ruta> {
    
    
    const ruta = await this.rutaModel.findById(id)
      .populate("ultima_caja")
      .populate("caja_actual")
    
    if(!ruta){
      throw new NotFoundException(`No existe una ruta con el id ${id}`);
    }

    await this.actualizarRuta(ruta);

    return ruta;

  }

  async update(id: string, updateRutaDto: UpdateRutaDto) {
    
    try {
      const rutaUpdate = await this.rutaModel.findByIdAndUpdate(id, updateRutaDto, {new: true});
      return rutaUpdate;
    } catch (error) {
      this.handleExceptions(error);
    }

  }

  async delete(id: string, globalParams: GlobalParams): Promise<boolean> {
    const { userId } = globalParams;
    const user = await this.authService.findOne(userId);

    await this.rutaModel.findByIdAndDelete(id);

    user.rutas = user.rutas.filter(ruta => ruta._id !== id);
    await user.save();

    return true;
  }

  async closeRuta(id: string, { fecha, caja }: GlobalParams): Promise<boolean> {

    const ruta = await this.findOne(id);

    await ruta.updateOne({
      status: false,
      ultimo_cierre: fecha.trim(),
      ultima_caja: ruta.caja_actual,
      turno: 1
    }, {new: true});
    
    await this.cajaService.actualizarCaja(caja) 

    return true;

  }

  async openRuta(id: string, globalParams: GlobalParams): Promise<boolean> {

    const { fecha } = globalParams;

    const ruta: Ruta = await this.findOne(id);

    let caja;

    if(!ruta.ultima_caja) {
      caja = await this.cajaModel.create({
        fecha: fecha,
        ruta: id
      })
    }

    if(ruta.ultima_caja){
      
      let creditosDeLaRuta = await this.creditoModel.find({
        ruta: ruta._id,
        status: true
      })

      let pretendido: number = 0;

      creditosDeLaRuta.forEach(credito => {
        pretendido += credito.valor_cuota;
      })

      caja = await this.cajaModel.create({
        base: ruta.ultima_caja.caja_final,
        caja_final: ruta.caja_actual.caja_final,
        ruta: id,
        pretendido,
        fecha: fecha.trim()
      })

      await this.cajaService.actualizarCaja(caja._id)
    }

    await ruta.updateOne({
      caja_actual: caja._id,
      status: true,
      ultima_apertura: fecha.trim()
    })

    return true;
  }

  async verificarSiCerroRuta(id: string): Promise<boolean>{
    const ruta = await this.findOne(id);

    if(ruta.ultima_apertura === ruta.ultima_caja.fecha){
      return true;
    }

    return false;
  }

  private handleExceptions(error: any) {
    if(error.code === 11000){
      throw new BadRequestException("Ya existe esta ruta");
    }

    this.logger.error(error);
    throw new InternalServerErrorException("Revisar los logs")
  }

  async actualizarRuta(ruta: Ruta) {
    let cartera: number = 0;
    let total_cobrado: number = 0;
    let gastos: number = 0;
    let retiros: number = 0;
    let inversiones: number = 0;
    let total_prestado: number = 0;

    let [ clientes, 
          clientes_activos, 
          creditosActivos, 
          allCreditos,
          allGastos,
          allRetiros,
          allInversiones ] = await Promise.all([
      this.clienteModel.countDocuments({ruta: ruta._id}),
      this.clienteModel.countDocuments({ruta: ruta._id, status: true}),
      this.creditoModel.find({ruta: ruta._id, status: true}),
      this.creditoModel.find({ruta: ruta._id}),
      this.gastoModel.find({ruta: ruta._id}),
      this.retiroModel.find({ruta: ruta._id}),
      this.inversionModel.find({ruta: ruta._id})
    ])

    
    creditosActivos.forEach(credito => {
      cartera += credito.saldo;
    });

    allCreditos.forEach(credito => {
      total_cobrado += credito.abonos;
      total_prestado += credito.valor_credito;
    })

    allGastos.forEach(gasto => {
      gastos += gasto.valor;
    })
    
    allRetiros.forEach(retiro => {
      retiros += retiro.valor;
    })

    allInversiones.forEach(inversion => {
      inversiones += inversion.valor;
    })


    await ruta.updateOne({
      cartera,
      total_cobrado,
      gastos,
      retiros,
      inversiones,
      total_prestado,
      clientes,
      clientes_activos,
    }, {new: true});

  }
}
