import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { CreateRetiroDto } from './dto/create-retiro.dto';
import { UpdateRetiroDto } from './dto/update-retiro.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Retiro } from './entities/retiro.entity';
import { Model } from 'mongoose';
import { MomentService } from '../common/plugins/moment/moment.service';
import { CajaService } from '../caja/caja.service';

@Injectable()
export class RetiroService {

  private logger = new Logger("RetiroService");

  constructor(
    @InjectModel(Retiro.name)
    private retiroModel: Model<Retiro>,
    private moment: MomentService,
    private cajaSvc: CajaService,
  ){}

  async create(createRetiroDto: CreateRetiroDto): Promise<Retiro> {
    try {

      const retiro = await this.retiroModel.create(createRetiroDto);

      let fecha = createRetiroDto.fecha.split('/');
      let newFecha = `${fecha[2]}-${fecha[1]}-${fecha[0]}`;
      let { ruta } = createRetiroDto;

      await this.cajaSvc.currentCaja(ruta, newFecha);

      return retiro;
      
    } catch (error) {

      this.handleExceptions(error);

    }
  }

  findAll() {
    return `This action returns all retiro`;
  }

  async findByDate(fecha: string, ruta: string) {
    
    let newFecha = this.moment.fecha(fecha, 'DD/MM/YYYY');

    const retiros = await this.retiroModel.find({
      ruta,
      fecha: newFecha
    });

    return retiros.map(retiro => ({
      ...retiro.toJSON(),
      fecha
    }))

  }

  findOne(id: number) {
    return `This action returns a #${id} retiro`;
  }

  update(id: number, updateRetiroDto: UpdateRetiroDto) {
    return `This action updates a #${id} retiro`;
  }

  remove(id: number) {
    return `This action removes a #${id} retiro`;
  }

  private handleExceptions(error: any) {
    this.logger.error(error);
    throw new InternalServerErrorException("Por favor revisa los logs")
  }
}
