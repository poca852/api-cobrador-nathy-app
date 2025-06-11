import { Injectable, NotFoundException, Logger, BadRequestException, InternalServerErrorException, forwardRef, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateRutaDto } from './dto/create-ruta.dto';
import { UpdateRutaDto } from './dto/update-ruta.dto';
import { Ruta } from './entities/ruta.entity';
import { Model } from 'mongoose';
import { getFormattedDate } from './../common/helpers'
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
import { LogRuta } from './entities/log-ruta';
import { MomentService } from '../common/plugins/moment/moment.service';
import { MessageGateway } from 'src/message/message.gateway';

@Injectable()
export class RutaService {

  private logger = new Logger("RutaService");

  constructor(
    private socketRuta: MessageGateway,

    @InjectModel(Ruta.name)
    private readonly rutaModel: Model<Ruta>,

    @InjectModel(LogRuta.name)
    private readonly logRutaModel: Model<LogRuta>,

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
    private readonly cajaService: CajaService,

    private moment: MomentService
  ) {}

  async create(createRutaDto: CreateRutaDto) {

    try {

      const ruta = await this.rutaModel.create(createRutaDto);

      return ruta;

    } catch (error) {

      this.handleExceptions(error)

    }

  }

  async findAll(): Promise<Ruta[]> {
    return await this.rutaModel.find()
  }

  async findByFilter(filter: any): Promise<Ruta[]> {

    return await this.rutaModel.find(filter)

  }

  async findOne(id: string): Promise<Ruta> {


    const ruta = await this.rutaModel.findById(id)
      .populate("ultima_caja")
      .populate("caja_actual")

    if (!ruta) {
      throw new NotFoundException(`No existe una ruta con el id ${id}`);
    }

    return ruta;

  }

  async update(id: string, updateRutaDto: UpdateRutaDto) {

    try {
      const rutaUpdate = await this.rutaModel.findByIdAndUpdate(id, updateRutaDto, { new: true });
      return rutaUpdate;
    } catch (error) {
      this.handleExceptions(error);
    }

  }

  async delete(id: string, globalParams: GlobalParams): Promise<boolean> {
    const { userId } = globalParams;
    const user = await this.authService.findOne(userId);

    // await this.rutaModel.findByIdAndDelete(id);

    // user.rutas = user.rutas.filter(ruta => ruta._id !== id);
    // await user.save();

    return true;
  }

  async closeRuta(id: string, fecha?: string): Promise<boolean> {

    const ruta = await this.findOne(id);
    
    const date = getFormattedDate(ruta.pais);

    if(!ruta.status) {
      throw new BadRequestException(`La ruta ya fue cerrada el dia ${date}`)
    }

    // POR EL MOMENTO VAMOS A RECIBIR LA FECHA COMO VENGA CON EL FORMATO DD/MM/YYYY MIENTRAS SOLUCIONO, OJO ESTO SE DEBE CAMBIAR
    await this.update(id, {
      status: false,
      ultimo_cierre: date,
      ultima_caja: ruta.caja_actual._id
    })

    await this.cajaService.actualizarCaja(ruta.caja_actual._id)
    await this.actualizarRuta(id);

    this.socketRuta.wss.emit('close-caja', { ruta: id });

    return true;

  }

  async openRuta(id: string): Promise<boolean> {

    const ruta: Ruta = await this.findOne(id);
    
    const fecha = getFormattedDate(ruta.pais);

    if(ruta.status) {
      throw new BadRequestException(`La ruta ya fue abierta el dia ${fecha}`)
    }

    const caja = ruta.ultima_caja 
      ? await this.createCajaWithUltimaCaja(ruta, fecha) 
      : await this.createCajaInicial(id, fecha);

    await ruta.updateOne({
      caja_actual: caja._id,
      status: true,
      ultima_apertura: fecha,
    });

    return true;

  }

  private async createCajaInicial(rutaId: string, fecha: string): Promise<any> {
    return this.cajaModel.create({
      fecha,
      ruta: rutaId
    })
  }

  private async createCajaWithUltimaCaja(ruta: Ruta, fecha: string): Promise<any> {
    const creditosDeLaRuta = await this.creditoModel.find({
      ruta: ruta._id,
      status: true
    });

    const pretendido = creditosDeLaRuta.reduce((sum, credito) => sum + credito.valor_cuota, 0);

    return this.cajaModel.create({
      base: ruta.ultima_caja.caja_final,
      caja_final: ruta.caja_actual.caja_final,
      ruta: ruta._id,
      total_clientes: creditosDeLaRuta.length,
      clientes_pendientes: creditosDeLaRuta.length,
      pretendido,
      fecha,
    });
  }

  private handleExceptions(error: any) {
    if (error.code === 11000) {
      throw new BadRequestException("Ya existe esta ruta");
    }

    this.logger.error(error);
    throw new InternalServerErrorException("Revisar los logs")
  }

  private roundToTwoDecimals(value: number): number {
    return Math.round(value * 100) / 100;
  }

  // ACTUALIZAR RUTA IMPLICA QUE SE DEBE CALCULAR NUEVAMENTE SU CARTERA, GASTOS Y DEMAS
  public async actualizarRuta(idRuta: any): Promise<void> {

    const ruta = await this.rutaModel.findById(idRuta);

    if (!ruta) throw new NotFoundException(`La ruta con el id ${idRuta} no existe`);

    try {

      const [clientes, clientesActivos, creditosActivos, allCreditos, allGastos, allRetiros, allInversiones] =
        await Promise.all([
          this.clienteModel.countDocuments({ ruta: ruta._id }),
          this.clienteModel.countDocuments({ ruta: ruta._id, status: true }),
          this.creditoModel.find({ ruta: ruta._id, status: true }),
          this.creditoModel.find({ ruta: ruta._id }),
          this.gastoModel.find({ ruta: ruta._id }),
          this.retiroModel.find({ ruta: ruta._id }),
          this.inversionModel.find({ ruta: ruta._id }),
        ]);

      const cartera = creditosActivos.reduce((sum, credito) => sum + credito.saldo, 0);
      const totalCobrado = allCreditos.reduce((sum, credito) => sum + credito.abonos, 0);
      const totalPrestado = allCreditos.reduce((sum, credito) => sum + credito.valor_credito, 0);
      const gastos = allGastos.reduce((sum, gasto) => sum + gasto.valor, 0);
      const retiros = allRetiros.reduce((sum, retiro) => sum + retiro.valor, 0);
      const inversiones = allInversiones.reduce((sum, inversion) => sum + inversion.valor, 0);

      await ruta.updateOne({
        cartera,
        total_cobrado: this.roundToTwoDecimals(totalCobrado),
        gastos,
        retiros,
        inversiones,
        total_prestado: totalPrestado,
        clientes,
        clientes_activos: clientesActivos,
      }, { new: true });

    } catch (error) {

      this.handleExceptions(error);

    }

  }

   //Esta funcion busca las rutas abiertas y las cierra
   public checkRutas = async () => {
    
    await this.processRuta({status: true}, this.closeRuta.bind(this))

  }

  //Esta funcion se encarga de abrir las rutas
  public checkOpenRutas = async () => {
    
    await this.processRuta({autoOpen: true, status: false}, this.openRuta.bind(this))

  }

  public async processRuta(
    filter: Record<string, any>,
    action: (rutaId: string) => Promise<void>
  ): Promise<void>  {
    const rutas = await this.rutaModel.find(filter);
    
    await Promise.all(
      rutas.map( async (ruta) => {
        try {
          await action(ruta._id);
        } catch (error) {
          console.log(error)
          this.handleExceptions(error)
        }
      })
    )

  }

}
