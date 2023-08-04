import { Injectable, Logger, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateCajaDto } from './dto/create-caja.dto';
import { UpdateCajaDto } from './dto/update-caja.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Caja } from './entities/caja.entity';
import { Ruta } from '../ruta/entities/ruta.entity';
import { Credito } from '../credito/entities/credito.entity';
import { Gasto } from '../gasto/entities/gasto.entity';
import { Retiro } from '../retiro/entities/retiro.entity';
import { Inversion } from '../inversion/entities/inversion.entity';
import { Pago } from '../pago/entities/pago.entity';
import { CampoActualizarDeCaja } from './interfaces/campo-actualizar-caja.enum';
import { GlobalParams } from 'src/common/dto/global-params.dto';

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
  ) { }

  create(createCajaDto: CreateCajaDto) {
    return 'This action adds a new caja';
  }

  findAll() {
    return `This action returns all caja`;
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

  public async actualizarCaja(idCaja: string): Promise<Caja> {

    const caja = await this.cajaModel.findById(idCaja)
      .populate("ruta");
      
    if(!caja) throw new NotFoundException("No existe la caja");

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
      this.gastoModel.find({ ruta: caja.ruta, fecha: caja.fecha }),
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

  private handleExceptions(error: any) {
    this.logger.error(error);
    throw new InternalServerErrorException("Por favor revisa los logs")
  }
}
