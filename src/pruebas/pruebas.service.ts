import { Injectable } from '@nestjs/common';
import { CreatePruebaDto } from './dto/create-prueba.dto';
import { UpdatePruebaDto } from './dto/update-prueba.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Credito } from 'src/credito/entities/credito.entity';
import { Model } from 'mongoose';

@Injectable()
export class PruebasService {

  constructor(
    @InjectModel(Credito.name)
    private readonly creditoModel: Model<Credito>
  ){}

  create(createPruebaDto: CreatePruebaDto) {
    return 'This action adds a new prueba';
  }

  async findAll() {
    const creditos = await this.creditoModel.find({
      status: true,
      ruta: "633dd53965aec04d0ad42015"
    })
      .select('-pagos')

    let cartera = 0;

    creditos.forEach(credito => {
      cartera += credito.saldo
    })

    return {
      creditos,
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
