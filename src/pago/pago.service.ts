import { Injectable, Logger, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { CreatePagoDto } from './dto/create-pago.dto';
import { UpdatePagoDto } from './dto/update-pago.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Pago } from './entities/pago.entity';
import { Model } from 'mongoose';
import { CreditoService } from '../credito/credito.service';
import { GlobalParams } from 'src/common/dto/global-params.dto';
import { PagoResponse } from './interfaces/pago-response.interface';

@Injectable()
export class PagoService {

  private logger = new Logger("PagoService");

  constructor(
    @InjectModel(Pago.name)
    private pagoModel: Model<Pago>,

    private readonly creditoService: CreditoService,
  ) {}

  async create(createPagoDto: CreatePagoDto): Promise<PagoResponse> {
    
    await this.creditoService.verificarSiElPagoEsMayor(createPagoDto.credito, createPagoDto.valor);

    const pago = await this.pagoModel.create(createPagoDto);

    const {message, urlMessage} = await this.creditoService.agregarPago(createPagoDto.credito, pago, createPagoDto.ruta);

    return {
      pago,
      message,
      urlMessage
    };

  }

  async findAll( { ruta, fecha }: GlobalParams ): Promise<Pago[]> {
    
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
