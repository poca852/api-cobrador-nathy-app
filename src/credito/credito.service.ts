import { Injectable, InternalServerErrorException, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
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
import { Ruta } from '../ruta/entities/ruta.entity';
import { InformeCredito } from './gnerar-informe-credito';
import { addDays, differenceInDays, getDay } from 'date-fns';

@Injectable()
export class CreditoService {

  private logger = new Logger("CreditoService");

  constructor(
    @InjectModel(Credito.name)
    private readonly creditoModel: Model<Credito>,

    @InjectModel(Cliente.name)
    private readonly clienteModel: Model<Cliente>,

    private readonly cajaService: CajaService,
    private readonly clienteService: ClienteService
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

      // await this.cajaService.actualizarCaja(createCreditoDto.ruta, createCreditoDto.fecha_inicio)

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

  async findOne(id: string) {
    const credito = await this.creditoModel.findById(id)
      .populate("cliente")
      .populate("pagos")

    if (!credito) {
      throw new NotFoundException(`Credito con el id ${id} no existe`);
    }

    return {
      ...credito.toJSON(),
      atraso: await this.calcularAtrasos(credito._id)
    };
  }

  update(id: number, updateCreditoDto: UpdateCreditoDto) {
    return `This action updates a #${id} credito`;
  }

  async remove(id: string) {

    try {
      const credito = await this.findOne(id);

      const cliente = await this.clienteService.findOne(credito.cliente._id);

      cliente.creditos = cliente.creditos.filter(cr => cr._id !== credito._id);
      cliente.status = false;
      await cliente.save();

      await this.creditoModel.findByIdAndRemove(id);

      return true;
    } catch (error) {
      this.hanldeExceptions(error)
    }


  }

  public async agregarPago(idCredito: string, pago: Pago, ruta: Ruta) {

    const credito = await this.creditoModel.findById(idCredito)
      .populate("cliente")
      .populate("pagos")

    await pago.save();

    credito.pagos.unshift(pago);

    let abonos: number = 0;

    credito.pagos.forEach(pago => {
      abonos += pago.valor;
    })

    let saldo = credito.total_pagar - abonos;

    credito.saldo = saldo,
      credito.abonos = abonos;
    credito.turno = ruta.turno;
    credito.ultimo_pago = pago.fecha.split(" ")[0];

    ruta.turno += 1;

    await credito.save();
    await ruta.save()

    await this.verificarSiTermino(credito);

    const factura = new InformeCredito(credito);
    const { message, urlMessage } = await factura.getMessage();

    return {
      true: true,
      message,
      urlMessage
    };

  }

  public verificarSiElPagoEsMayor(credito: Credito, valor: number): void {

    if (valor > credito.saldo) {
      throw new BadRequestException(`El saldo del cliente es ${credito.saldo}`)
    }

  }

  public verificarSiElPagoEsMayorActualizando(credito: Credito, pago: Pago, nuevoPago: number) {

    let nuevoSaldo = credito.saldo + pago.valor;
    if (nuevoPago > nuevoSaldo) {
      throw new BadRequestException(`El Monto maximo que puedes ingresar es ${nuevoSaldo}`)
    }

  }

  public async verificarSiTermino(credito: Credito): Promise<void> {

    if (credito.saldo === 0) {
      await credito.updateOne({ status: false }, { new: true });
      await this.clienteService.update(credito.cliente._id, { status: false });
      return;
    }

    await credito.updateOne({ status: true }, { new: true });
    await this.clienteService.update(credito.cliente._id, { status: true });
    return;

  }

  public async rectificarCredito(idCredito: string) {

    const credito = await this.findOne(idCredito);

    let abonos: number = 0;

    credito.pagos.forEach(pago => {
      abonos += pago.valor;
    })

    let saldo = credito.total_pagar - abonos;

    credito.saldo = saldo,
      credito.abonos = abonos;

    await credito.save();

    await this.verificarSiTermino(credito);

    return true;


  }

  public async calcularAtrasos(idCredito: string) {
    const credito = await this.creditoModel.findById(idCredito);
    let q = credito.fecha_inicio.split('/')
    let newFecha = `${q[2]}-${q[1]}-${q[0]}`;

    const fechaInicioCredito = new Date(newFecha);

    const fechaInicioPagos = addDays(fechaInicioCredito, 1);
    
    const fechaActual = new Date();
  
    const totalDias = differenceInDays(fechaActual, fechaInicioPagos);
  
    let diasEfectivosPago = totalDias;
    let fecha = fechaInicioPagos;
    for (let i = 0; i < totalDias; i++) {
      if (getDay(fecha) === 0) {
        diasEfectivosPago--;
      }
      fecha = addDays(fecha, 1);
    }
  
    const valorCuota = credito.valor_cuota;
    const totalAbonos = credito.abonos;
  
    const pagosRealizados = Math.floor(totalAbonos / valorCuota);
    const pagosRequeridos = credito.total_cuotas;
  
    const atrasos = Math.max(diasEfectivosPago - pagosRealizados, 0);
    const atrasosMaximos = (pagosRequeridos - 1) * 1; // Restamos 1 para representar el día en que se dio el crédito
  
    return Math.min(atrasos, atrasosMaximos);
  }
  

  private hanldeExceptions(error: any) {
    this.logger.error(error);
    throw new InternalServerErrorException("Por favor revisa los logs")
  }
}
