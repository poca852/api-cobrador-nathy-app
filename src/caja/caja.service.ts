import { Injectable, Logger, InternalServerErrorException, NotFoundException, forwardRef, Inject } from '@nestjs/common';
import { CreateCajaDto } from './dto/create-caja.dto';
import { UpdateCajaDto } from './dto/update-caja.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Caja } from './entities/caja.entity';
import { Credito } from '../credito/entities/credito.entity';
import { Gasto } from '../gasto/entities/gasto.entity';
import { Retiro } from '../retiro/entities/retiro.entity';
import { Inversion } from '../inversion/entities/inversion.entity';
import { Pago } from '../pago/entities/pago.entity';
import { User } from 'src/auth/entities/user.entity';
import { AuthService } from '../auth/auth.service';
import { CierreCaja } from './entities/cierre_caja.entity';
import { RutaService } from '../ruta/ruta.service';

@Injectable()
export class CajaService {

  private logger = new Logger("CajaService");

  constructor(
    @InjectModel(Caja.name)
    private readonly cajaModel: Model<Caja>,

    @InjectModel(Gasto.name)
    private readonly gastoModel: Model<Gasto>,

    @InjectModel(Retiro.name)
    private readonly retiroModel: Model<Retiro>,

    @InjectModel(Inversion.name)
    private readonly inversionModel: Model<Inversion>,

    @InjectModel(Pago.name)
    private readonly pagoModel: Model<Pago>,

    @InjectModel(Credito.name)
    private readonly creditoModel: Model<Credito>,

    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,

    @InjectModel(CierreCaja.name)
    private CcModel: Model<CierreCaja>,

    @Inject(forwardRef(() => RutaService))
    private rutaSvc: RutaService
  ) { }

  create(createCajaDto: CreateCajaDto) {
    return 'This action adds a new caja';
  }

  async findAll(user: User, fecha: string, ) {
    
    let listaDePromsesasDeCajas = [];

    user.rutas.forEach((ruta) => {
      listaDePromsesasDeCajas.push(
        this.cajaModel.findOne({ruta, fecha})
          .populate({
            path: "ruta",
            select: "nombre"
          })
      )
    })

    const cajas = await Promise.all(listaDePromsesasDeCajas);

    return cajas;

  }

  async findOne(id: string) {
    
    return await this.actualizarCaja(id);

  }

  update(id: number, updateCajaDto: UpdateCajaDto) {
    return `This action updates a #${id} caja`;
  }

  remove(id: number) {
    return `This action removes a #${id} caja`;
  }

  public async actualizarCaja(idCaja: string|undefined, idRuta?: string): Promise<Caja> {

    let id = idCaja;

    if(!idCaja){
      const ruta = await this.rutaSvc.findOne(idRuta);
      id = ruta.caja_actual._id;
    }

    const caja = await this.cajaModel.findById(id)
      .populate("ruta");
      
    if(!caja) throw new NotFoundException("No existe la caja");


    // TODO: ESTO es provicional mientras actualizo el modelo de caja
    let splitFecha = caja.fecha.split("/");
    let nuevaFecha = `${splitFecha[2]}, ${splitFecha[1]}, ${splitFecha[0]}`;

    let fechaInicio = new Date(nuevaFecha)
    fechaInicio.setHours(0, 0, 0, 0);

    let fechaFin = new Date(nuevaFecha);
    fechaFin.setHours(23, 59, 59, 999);

    const [ todosLosCreditosDeLaRuta, 
            creditosRenovadosHoy, 
            pagosDelDiaDeHoy, 
            invesionesDelDiaDeHoy, 
            gastosDelDiaDeHoy, 
            retirosDelDiaDeHoy, 
            numeroDeClientesQuePagaronHoy] = await Promise.all([
      this.creditoModel.find({ ruta: caja.ruta, status: true }),
      this.creditoModel.find({ ruta: caja.ruta, fecha_inicio: caja.fecha })
        .populate('pagos'),
      this.pagoModel.find({ ruta: caja.ruta, fecha: new RegExp(caja.fecha, 'i') })
        .populate("credito"),
      this.inversionModel.find({ ruta: caja.ruta, fecha: caja.fecha }),
      this.gastoModel.find({
        ruta: caja.ruta,
        $and: [
          { fecha: { $gte: fechaInicio } },
          { fecha: { $lt: fechaFin } }
        ]
      }),
      this.retiroModel.find({ ruta: caja.ruta, fecha: caja.fecha }),
      this.pagoModel.countDocuments({ ruta: caja.ruta, fecha: new RegExp(caja.fecha, 'i') })
    ]);

    let extra = 0;

    // primero verificar que pagos se han echo por encima de su valor de cutoa;
    pagosDelDiaDeHoy.forEach(pago => {
      if (pago.valor > pago.credito.valor_cuota) {
        extra += pago.valor - pago.credito.valor_cuota
      }
    })

    creditosRenovadosHoy.forEach(credito => {
      if (credito.pagos.length > 0) {
        extra += credito.pagos[0].valor;
      }
    })


    let base = caja.base;
    let inversion = 0;
    let retiro = 0;
    let gasto = 0;
    let cobro = 0;
    let prestamo = 0;
    let total_clientes = 0;
    let renovaciones = 0;

    invesionesDelDiaDeHoy.forEach(inves => {
      inversion += inves.valor;
    })

    retirosDelDiaDeHoy.forEach(re => {
      retiro += re.valor;
    })

    todosLosCreditosDeLaRuta.forEach(credito => {
      total_clientes += 1;
    })

    gastosDelDiaDeHoy.forEach(g => {
      gasto += g.valor;
    })

    pagosDelDiaDeHoy.forEach(pago => {
      cobro += pago.valor;
    })

    creditosRenovadosHoy.forEach(credito => {
      prestamo += credito.valor_credito;
      renovaciones += 1;
    })

    caja.base = base;
    caja.inversion = inversion;
    caja.retiro = retiro;
    caja.gasto = gasto;
    caja.cobro = cobro;
    caja.prestamo = prestamo;
    caja.total_clientes = total_clientes,
    caja.clientes_pendientes = total_clientes - numeroDeClientesQuePagaronHoy
    caja.renovaciones = renovaciones,
    caja.extra = extra;
    caja.caja_final = (base + inversion + cobro) - (retiro + gasto + prestamo)

    await caja.save()
    return caja;

  }

  // Cerrar caja
  async closeCaja(idCaja: string, user: User, fecha: Date): Promise<boolean> {

    const caja = await this.findOne(idCaja);

    try {
      
      await this.CcModel.create({
        user: user._id,
        caja: idCaja,
        saldo: caja.caja_final,
        date: fecha.toLocaleDateString('es'),
        ruta: caja.ruta._id
      })

      return true;
      

    } catch (error) {

      this.handleExceptions(error);

    }

  }

  private handleExceptions(error: any) {
    this.logger.error(error);
    throw new InternalServerErrorException("Por favor revisa los logs")
  }
}
