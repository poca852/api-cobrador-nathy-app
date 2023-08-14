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
  ) {}

  async create(createCreditoDto: CreateCreditoDto): Promise<Credito> {
    
    try {
      
      const cliente = await this.clienteModel.findById(createCreditoDto.cliente);

      if(!cliente) {
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
    
    const { ruta, status = "true" } = globalParams;

    const creditos = await this.creditoModel.find({
      status: isTrue(status),
      ruta
    })
      .populate("cliente")
      .populate("pagos")
      .sort({turno: 1})

    return creditos;

  }

  async findOne(id: string): Promise<Credito> {
    const credito = await this.creditoModel.findById(id)
      .populate("cliente")
      .populate("pagos");

    if(!credito) {
      throw new NotFoundException(`Credito con el id ${id} no existe`);
    }

    return credito;
  }

  update(id: number, updateCreditoDto: UpdateCreditoDto) {
    return `This action updates a #${id} credito`;
  }

  remove(id: number) {
    return `This action removes a #${id} credito`;
  }

  public async agregarPago(credito: Credito, pago: Pago, ruta: Ruta){

    this.verificarSiElPagoEsMayor(credito, pago.valor);

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
    const message = factura.getMessage();

    return {
      true: true,
      message
    };

  }

  public verificarSiElPagoEsMayor(credito: Credito, valor: number): void {

    if(valor > credito.saldo) {
      throw new BadRequestException(`El saldo del cliente es ${credito.saldo}`)
    }

  }

  public verificarSiElPagoEsMayorActualizando(credito: Credito, pago: Pago, nuevoPago: number) {

    let nuevoSaldo = credito.saldo + pago.valor;
    if(nuevoPago > nuevoSaldo) {
      throw new BadRequestException(`El Monto maximo que puedes ingresar es ${nuevoSaldo}`)
    }

  }

  public async verificarSiTermino(credito: Credito): Promise<void>{

    if(credito.saldo === 0){
      await credito.updateOne({status: false}, {new: true});
      await this.clienteService.update(credito.cliente._id, {status: false});
      return;
    }

    await credito.updateOne({status: true}, {new: true});
    await this.clienteService.update(credito.cliente._id, {status: true});
    return;

  }

  public async rectificarCredito(idCredito: string){

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

  private hanldeExceptions(error: any) {
    this.logger.error(error);
    throw new InternalServerErrorException("Por favor revisa los logs")
  }
}
