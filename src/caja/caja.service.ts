import { Injectable, Logger, InternalServerErrorException, NotFoundException, forwardRef, Inject, BadRequestException } from '@nestjs/common';
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
import { MomentService } from '../common/plugins/moment/moment.service';

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
    private rutaSvc: RutaService,
    private moment: MomentService,
  ) { }

  create(createCajaDto: CreateCajaDto) {
    return 'This action adds a new caja';
  }

  async findAll(ruta: string, fecha: string,) {

    const caja = await this.cajaModel.findOne({
      ruta,
      fecha
    })

    if (!caja) {
      throw new NotFoundException('No se encontraron registro de este dia')
    }

    return caja;

  }

  async findOne(id: string) {

    return await this.actualizarCaja(id);

  }

  async findFecha(fecha: string, ruta: string) {

    const newFecha = this.moment.fecha(fecha, 'DD/MM/YYYY');

    const caja = await this.cajaModel.findOne({fecha: newFecha, ruta}).populate('ruta')
    if(!caja) {
      throw new NotFoundException('Olvido cerrar la ruta, hable con el administrador del sistema')
    }

    return caja;

  }

  async currentCaja(ruta: string, fecha: string) {

    // FECHA PROPIA se lo asigno porque lastimosamente es la fecha que eligi para el manejo de la fecha de la caja, despues esto se tiene que arregar
    const fechaPropia = this.moment.fecha(fecha, 'DD/MM/YYYY');

    // esta es la fecha que ya manejamos en los gastos que es un isostring, aca cogemos la fecha que nos mandan por querys que es en formato de isostring
    const fechaParseada = new Date(fecha);

    const caja = await this.cajaModel.findOne({ ruta, fecha: fechaPropia })
      .populate([
        {
          path: 'ruta',
          populate: 'ultima_caja'
        }
      ]);
    if (!caja) throw new BadRequestException('La ruta no fue cerrada');

    const [
      allCreditos,
      renovaciones,
      pagosOfDay,
      retiros,
      inversiones,
      gastos,
    ] = await Promise.all([
      this.creditoModel.find({ status: true, ruta }),
      this.creditoModel.find({ ruta, status: true, fecha_inicio: fechaPropia }).populate('pagos'),
      this.pagoModel.find({ ruta, fecha: new RegExp(fechaPropia, 'i') }).populate('credito'),
      this.retiroModel.find({ ruta, fecha: fechaPropia }),
      this.inversionModel.find({ ruta, fecha: fechaPropia }),
      this.gastoModel.find({
        ruta,
        fecha: {
          $gte: fechaParseada,
          $lte: new Date(fechaParseada.getTime() + 24 * 60 * 60 * 1000)
        }
      }),
    ]);


    // Estos dos bloques manejan el extra del dia, el extra del dia se compone de pagosextra y creditos a los cuales le abonaron en el mismo dia.
    const extraPorPagos = pagosOfDay
      .filter(({ valor, credito }) => valor > credito.valor_cuota)
      .reduce((totalExtra, { valor, credito }) => totalExtra + (valor - credito.valor_cuota), 0);

    const extraPorCreditosRenovados = renovaciones
      .filter(credito => credito.pagos.length > 0)
      .reduce((totalExtra, credito) => totalExtra + credito.pagos[0].valor, 0);

    const extra = extraPorPagos + extraPorCreditosRenovados;

    // PAGOS
    let cobro = pagosOfDay.reduce((sum, pago) => sum + pago.valor, 0);

    // PRESTAMOS
    let prestamo = renovaciones.reduce((sum, credito) => sum + credito.valor_credito, 0);

    // NUMERO DE RENOVACIONES
    let numeroDeRenovaciones = renovaciones.length;

    // TOTAL DE CLIENTES
    let totalClientes = allCreditos.length;

    // INVERSION
    let inversion = inversiones.reduce((sum, inversion) => sum + inversion.valor, 0)

    // RETIRO
    let retiro = retiros.reduce((sum, retiro) => sum + retiro.valor, 0)

    // GASTOS
    let gasto = gastos.reduce((sum, gasto) => sum + gasto.valor, 0)

    // TENIAN QUE PAGAR
    let tenianQuePagar = pagosOfDay
      .filter(pago => pago.credito.fecha_inicio !== fechaPropia);

    // caja.base = caja.ruta.ultima_caja.caja_final;
    caja.inversion = inversion;
    caja.retiro = retiro;
    caja.gasto = gasto;
    caja.cobro = cobro;
    caja.prestamo = prestamo;
    caja.total_clientes = totalClientes,
    caja.clientes_pendientes = (totalClientes - numeroDeRenovaciones) - tenianQuePagar.length
    caja.renovaciones = numeroDeRenovaciones,
    caja.extra = extra;
    caja.caja_final = (caja.base + inversion + cobro) - (retiro + gasto + prestamo)

    await caja.save()
    return caja;

  }

  update(id: number, updateCajaDto: UpdateCajaDto) {
    return `This action updates a #${id} caja`;
  }

  remove(id: number) {
    return `This action removes a #${id} caja`;
  }

  public async actualizarCaja(idCaja: string | undefined, idRuta?: string): Promise<Caja> {

    let id = idCaja;

    if (!idCaja) {
      const ruta = await this.rutaSvc.findOne(idRuta);
      id = ruta.caja_actual._id;
    }

    const caja = await this.cajaModel.findById(id)
      .populate("ruta");

    if (!caja) throw new NotFoundException("No existe la caja");


    // TODO: ESTO es provicional mientras actualizo el modelo de caja
    let splitFecha = caja.fecha.split("/");
    let nuevaFecha = `${splitFecha[2]}, ${splitFecha[1]}, ${splitFecha[0]}`;

    let fechaInicio = new Date(nuevaFecha)
    fechaInicio.setHours(0, 0, 0, 0);

    let fechaFin = new Date(nuevaFecha);
    fechaFin.setHours(23, 59, 59, 999);

    const [todosLosCreditosDeLaRuta,
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
