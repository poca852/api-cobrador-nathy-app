import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
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
        path: "cliente",
        select: "nombre alias"
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

    const credito = await this.creditoService.findOne(pago.credito._id);

    this.creditoService.verificarSiElPagoEsMayorActualizando(credito, pago, updatePagoDto.valor);

    await pago.updateOne(updatePagoDto, {new: true});

    await this.creditoService.rectificarCredito(credito._id);

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
