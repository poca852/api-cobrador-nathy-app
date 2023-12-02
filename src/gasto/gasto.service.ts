import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { CreateGastoDto } from './dto/create-gasto.dto';
import { UpdateGastoDto } from './dto/update-gasto.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Gasto } from './entities/gasto.entity';
import { Model } from 'mongoose';
import { GlobalParams } from 'src/common/dto/global-params.dto';
import { CajaService } from 'src/caja/caja.service';
import { RutaService } from '../ruta/ruta.service';
import { User } from '../auth/entities/user.entity';
import { MomentService } from '../common/plugins/moment/moment.service';

@Injectable()
export class GastoService {

  private logger = new Logger("GastoService");

  constructor(
    @InjectModel(Gasto.name)
    private readonly gastoModel: Model<Gasto>,

    private cajaService: CajaService,
    private rutaService: RutaService,
    private moment: MomentService,
  ) {}

  async create(createGastoDto: CreateGastoDto): Promise<boolean> {
    try {
      
      await this.gastoModel.create(createGastoDto);
      await this.cajaService.currentCaja(createGastoDto.ruta, this.moment.fecha(createGastoDto.fecha, 'YYYY-MM-DD'));
      return true;

    } catch (error) {

      this.handleException(error)

    } 
  }

  async findByDate(globalParams: GlobalParams) {
    
    const fecha = new Date(globalParams.fecha);

    return await this.gastoModel.find({
      ruta: globalParams.ruta,
      fecha: {
        $gte: fecha,
        $lte: new Date(fecha.getTime() + 24 * 60 * 60 * 1000)
      }
    })
      .populate({
        path: "gasto",
        select: "gasto"
      })

    // return gastos.map(gasto => ({
    //   ...gasto.toJSON(),
    //   gasto: gasto.gasto.gasto
    // }))

  }

  async findAll({ruta}: GlobalParams): Promise<Gasto[]> {  
    return await this.gastoModel.find({ ruta });
  }

  findOne(id: number) {
    return `This action returns a #${id} gasto`;
  }

  async update(id: string, updateGastoDto: UpdateGastoDto) {
    
    try {
      
      const { ruta } = await this.gastoModel.findByIdAndUpdate(id, updateGastoDto, {new: true});
      await this.cajaService.actualizarCaja(undefined, `${ruta}`);

      return true;

    } catch (error) {
      this.handleException(error);
    }

  }

  remove(id: number) {
    return `This action removes a #${id} gasto`;
  }

  private handleException(error: any) {

    if(error.code === 11000) throw new BadRequestException("Ya existe ese gasto");

    this.logger.error(error);
    throw new InternalServerErrorException("revisa el logs");

  }
}
