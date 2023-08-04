import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { CreatePagoDto } from './dto/create-pago.dto';
import { UpdatePagoDto } from './dto/update-pago.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Pago } from './entities/pago.entity';
import { Model } from 'mongoose';
import { Credito } from '../credito/entities/credito.entity';
import { Cliente } from 'src/cliente/entities/cliente.entity';
import { CreditoService } from '../credito/credito.service';
import { GlobalParams } from 'src/common/dto/global-params.dto';
import { RutaService } from '../ruta/ruta.service';

@Injectable()
export class PagoService {

  private logger = new Logger("PagoService");

  constructor(
    @InjectModel(Pago.name)
    private pagoModel: Model<Pago>,

    @InjectModel(Credito.name)
    private creditoModel: Model<Credito>,

    @InjectModel(Cliente.name)
    private clienteModel: Model<Cliente>,

    private readonly creditoService: CreditoService,
    private readonly rutaService: RutaService
  ) {}

  async create(createPagoDto: CreatePagoDto): Promise<Pago> {

    const credito = await this.creditoService.findOne(createPagoDto.credito);

    const ruta = await this.rutaService.findOne(createPagoDto.ruta);
    
    const pago = new this.pagoModel(createPagoDto);

    await this.creditoService.agregarPago(credito, pago, ruta);

    return pago;

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
