import { Injectable } from '@nestjs/common';
import { CreatePruebaDto } from './dto/create-prueba.dto';
import { UpdatePruebaDto } from './dto/update-prueba.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Credito } from 'src/credito/entities/credito.entity';
import { Model } from 'mongoose';
import { RutaService } from '../ruta/ruta.service';

@Injectable()
export class PruebasService {

  constructor(
    @InjectModel(Credito.name)
    private readonly creditoModel: Model<Credito>,

    private readonly rutaSvc: RutaService
  ){}

  create(createPruebaDto: CreatePruebaDto) {
    return 'This action adds a new prueba';
  }

  async findAll(ruta: string) {
    const creditos = await this.creditoModel.find({
      status: true,
      ruta
    })
      .select('-pagos')
      .populate([
        { path: 'ruta', select: 'nombre'}
      ])


    await this.rutaSvc.actualizarRuta(ruta);

    let cartera = 0;
    let nombre: string;

    creditos.forEach(credito => {
      cartera += credito.saldo;
      nombre = credito.ruta.nombre
    })

    return {
      ruta: nombre,
      cartera
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} prueba`;
  }

  update(id: number, updatePruebaDto: UpdatePruebaDto) {
    return `This action updates a #${id} prueba`;
  }

  remove(id: number) {
    return `This action removes a #${id} prueba`;
  }
}
