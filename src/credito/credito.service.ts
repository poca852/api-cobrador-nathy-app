import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateCreditoDto } from './dto/create-credito.dto';
import { UpdateCreditoDto } from './dto/update-credito.dto';
import { GlobalParams } from '../common/dto/global-params.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Credito } from './entities/credito.entity';
import { Model } from 'mongoose';
import { Cliente } from '../cliente/entities/cliente.entity';
import { CajaService } from '../caja/caja.service';
import { isTrue } from 'src/common/helpers/isTrue';
import { Pago } from '../pago/entities/pago.entity';
import { ClienteService } from '../cliente/cliente.service';
import { CalculadorDeAtrasos } from './helpers/atrasos-credito';
import { getSaldo } from './helpers/get-saldo-credito';
import { getAbonos } from './helpers/get-abonos-credito';
import { User } from 'src/auth/entities/user.entity';
import { MomentService } from '../common/plugins/moment/moment.service';
import { EmpresaService } from '../empresa/empresa.service';

@Injectable()
export class CreditoService {

  private logger = new Logger("CreditoService");

  constructor(
    @InjectModel(Credito.name)
    private readonly creditoModel: Model<Credito>,

    @InjectModel(Cliente.name)
    private readonly clienteModel: Model<Cliente>,

    private readonly cajaService: CajaService,
    private readonly clienteService: ClienteService,
    private empresaSvc: EmpresaService,
    private moment: MomentService
  ) { }

  async create(createCreditoDto: CreateCreditoDto): Promise<Credito> {

    try {

      const cliente = await this.clienteModel.findById(createCreditoDto.cliente);

      if (!cliente) {
        throw new NotFoundException(`Cliente con el id ${createCreditoDto.cliente} no existe`);
      }

      const newCredito = await this.creditoModel.create(createCreditoDto);
      cliente.status = true;
      cliente.creditos.unshift(newCredito);
      await cliente.save();

      let fecha = createCreditoDto.fecha_inicio.split('/');
      let newFecha = `${fecha[2]}-${fecha[1]}-${fecha[0]}`;

      await this.cajaService.currentCaja(createCreditoDto.ruta, newFecha)

      return newCredito;

    } catch (error) {
      this.hanldeExceptions(error)
    }

  }

  async findAll(globalParams: GlobalParams): Promise<Credito[]> {

    const { ruta, status = "true", fecha } = globalParams;

    if (fecha) {

      const creditos = await this.creditoModel.find({
        ruta,
        fecha_inicio: fecha
      })
        .populate("cliente")
        .populate("pagos")
        .sort({ turno: 1 })

      return creditos

    }

    const creditos = await this.creditoModel.find({
      status: isTrue(status),
      ruta
    })
      .populate("cliente")
      .populate("pagos")
      .sort({ turno: 1 })

    return creditos;

  }

  async findRenovaciones(fecha: string, user: User) {

    const empresa = await this.empresaSvc.findOne(`${user.empresa}`)
    const rutas = empresa.rutas.map(ruta => ruta._id);
    return await this.creditoModel.find({
      fecha_inicio: fecha,
      ruta: { $in: rutas }
    })
      .populate([
        { path: 'pagos' },
        { 
          path: 'cliente',
          populate: {
            path: 'creditos'
          }
        },
        { path: 'ruta' },
      ])

  }

  async findOne(id: string) {
    const credito = await this.creditoModel.findById(id)
      .populate("cliente")
      .populate("pagos")

    if (!credito) {
      throw new NotFoundException(`Credito con el id ${id} no existe`);
    }

    return {
      ...credito.toJSON()
    };
  }

  async update(id: string, updateCreditoDto: UpdateCreditoDto, fecha: string) {
    try {
      const creditoUpdate = await this.creditoModel.findByIdAndUpdate(id, updateCreditoDto, {new: true});

      if(creditoUpdate.fecha_inicio === this.moment.fecha(fecha, 'DD/MM/YYYY')){
        await this.cajaService.currentCaja(`${creditoUpdate.ruta}`, fecha)
        return creditoUpdate;
      }
      
      let fechaSplit = creditoUpdate.fecha_inicio.split('/');
      let newFecha = `${fechaSplit[2]}-${fechaSplit[1]}-${fechaSplit[0]}`;
      await this.cajaService.currentCaja(`${creditoUpdate.ruta}`, newFecha);
      await this.cajaService.currentCaja(`${creditoUpdate.ruta}`, fecha);
      
      return creditoUpdate;
      
    } catch (error) {
      this.hanldeExceptions(error);
    }
  }

  async updateTurno(id: string, updateCreditoDto: UpdateCreditoDto) {
    try {

      await this.creditoModel.findByIdAndUpdate(id, updateCreditoDto, {new: true});

      return true;
      
    } catch (error) {
      this.hanldeExceptions(error);
    }
  }

  async remove(id: string) {

    try {
      const credito = await this.findOne(id);

      const cliente = await this.clienteService.findOne(credito.cliente._id);

      cliente.creditos = cliente.creditos.filter(cr => cr._id !== credito._id);
      cliente.status = false;
      await cliente.save();

      await this.creditoModel.findByIdAndRemove(id);

      if(credito.fecha_inicio !== this.moment.nowWithFormat('DD/MM/YYYY')){
        let queryFecha = credito.fecha_inicio.split('/');
        let newFecha = `${queryFecha[2]}-${queryFecha[1]}-${queryFecha[0]}`;

        await this.cajaService.currentCaja(`${credito.ruta}`, newFecha)
      }
      
      await this.cajaService.currentCaja(`${credito.ruta}`, this.moment.nowWithFormat('YYYY-MM-DD'));

      return true;
    } catch (error) {
      this.hanldeExceptions(error)
    }


  }

  // RELACIONADO CON LOS PAGOS

  public async agregarPago(idCredito: string, pago: Pago, fecha: string) {

    const credito = await this.creditoModel.findById(idCredito)
      .populate("cliente")
      .populate("pagos")

    credito.pagos.unshift(pago);
    credito.saldo = getSaldo(credito),
    credito.abonos = getAbonos(credito);
    credito.ultimo_pago = pago.fecha.split(" ")[0];

    await credito.save();

    await this.verificarSiTermino(credito);

    const message = await this.updateStateCredit(idCredito, fecha);

    return {
      true: true,
      message,
    };

  }

  // <==== AGREGAR STATE AL CREDITO DEPENDIENDO SUS ATRASASOS =====>
  public async updateStateCredit(idCredito: string, fecha: string) {

    const credito = await this.creditoModel.findById(idCredito)
      .populate('cliente')
      .populate('pagos')

    if(!credito) throw new NotFoundException(`Credito con el id ${idCredito} no fue encontrado`);

    const calculadorDeAtrasos = new CalculadorDeAtrasos(credito, fecha);

    // Inmediatamente descargamos la factura para enviarla al cliente
    const factura = calculadorDeAtrasos.getMessage();
    credito.atraso = calculadorDeAtrasos.calcularAtrasos();

    if(credito.atraso > 5) {
      credito.state = 'MALO'
    }else if(credito.atraso > 2 && credito.atraso < 5){
      credito.state = 'REGULAR'
    }else {
      credito.state = 'BUENO'
    }

    await credito.save();

    return factura
  }  

  public async verificarSiElPagoEsMayor(idCredito: string, valor: number): Promise<boolean> {

    const credito = await this.findOne(idCredito);

    if (valor > credito.saldo) {
      return true;
    }

    return false;

  }

  public async verificarSiElPagoEsMayorActualizando(idCredito: string, oldPay: number, newPay: number): Promise<boolean> {

    const credito = await this.creditoModel.findById(idCredito);

    let oldSaldo = credito.saldo + oldPay;

    if (newPay > oldSaldo) {
      return false
    }

    return true;

  }

  public async verificarSiTermino(credito: Credito): Promise<void> {

    if (credito.saldo === 0) {
      await credito.updateOne({ status: false });
      await this.clienteService.update(credito.cliente._id, { status: false });
      return;
    }

    await credito.updateOne({ status: true });
    await this.clienteService.update(credito.cliente._id, { status: true });
    return;

  }

  public async rectificarCredito(idCredito: string) {

    const credito = await this.creditoModel.findById(idCredito).populate('pagos')

    credito.saldo = getSaldo(credito);
    credito.abonos = getAbonos(credito);

    await credito.save();

    await this.verificarSiTermino(credito);

    return true;

  }

  private hanldeExceptions(error: any) {
    this.logger.error(error);
    throw new InternalServerErrorException("Por favor revisa los logs")
  }
}
