import { Injectable, Logger, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { CreatePagoDto } from './dto/create-pago.dto';
import { UpdatePagoDto } from './dto/update-pago.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Pago } from './entities/pago.entity';
import { Model } from 'mongoose';
import { CreditoService } from '../credito/credito.service';
import { GlobalParams } from 'src/common/dto/global-params.dto';
import { PagoResponse } from './interfaces/pago-response.interface';
import { CajaService } from '../caja/caja.service';
import { MomentService } from '../common/plugins/moment/moment.service';

@Injectable()
export class PagoService {

  private logger = new Logger("PagoService");

  constructor(
    @InjectModel(Pago.name)
    private pagoModel: Model<Pago>,

    private readonly creditoService: CreditoService,
    private cajaSvc: CajaService,
    private moment: MomentService,
  ) {}

  
  async create(createPagoDto: CreatePagoDto, fecha: string): Promise<PagoResponse> {
    const pago = await this.pagoModel.create(createPagoDto);

    const {message} = await this.creditoService.agregarPago(createPagoDto.credito, pago, this.moment.fecha(fecha, 'YYYY-MM-DD'));

    await this.cajaSvc.currentCaja(createPagoDto.ruta, this.moment.fecha(fecha,'YYYY-MM-DD'));

    return {
      pago,
      message,
    };

  }

  async findAll( fecha: string, ruta: string ): Promise<Pago[]> {
    const pagos = await this.pagoModel.find({
      ruta,
      fecha: new RegExp(fecha, "i")
    })
      .populate({
        path: "cliente"
      })
      .populate({
        path: "credito",
        populate: {
          path: "pagos"
        }
      })

    return pagos;

  }

  async findOne(id: string): Promise<Pago> {
    
    const pago = await this.pagoModel.findById(id)
      .populate({
        path: "cliente",
        select: "nombre alias"
      })
      .populate({
        path: "credito",
        populate: {
          path: "pagos"
        }
      })

    return pago;

  }

  async update(id: string, updatePagoDto: UpdatePagoDto) {
    
    const pago = await this.findOne(id);

    const sePuedeProcesarElPago = await this.creditoService.verificarSiElPagoEsMayorActualizando(pago.credito._id, pago.valor, updatePagoDto.valor);

    if(!sePuedeProcesarElPago){
      throw new BadRequestException('No se puede procesar el pago, porque el valor ingresado supera el saldo')
    }

    await pago.updateOne(updatePagoDto, {new: true});

    await this.creditoService.rectificarCredito(pago.credito._id);

    let q = pago.fecha.split(' ')[0];
    let nq = q.split('/');
    let fecha = `${nq[2]}-${nq[1]}-${nq[0]}`;

    await this.cajaSvc.currentCaja(`${pago.ruta}`, fecha);

    return true;
    
  }

  remove(id: number) {
    return `This action removes a #${id} pago`;
  }

  private handleExceptions(error: any) {
    this.logger.error(error);
    throw new InternalServerErrorException("Revisa el console.log")
  }
}
