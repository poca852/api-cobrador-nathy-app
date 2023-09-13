import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Cliente } from './entities/cliente.entity';
import { Model } from 'mongoose';
import { GlobalParams } from '../common/dto/global-params.dto';
import { isTrue } from 'src/common/helpers/isTrue';
import { Credito } from 'src/credito/entities/credito.entity';

@Injectable()
export class ClienteService {

  private logger = new Logger("ClienteService");

  constructor(
    @InjectModel(Cliente.name)
    private clienteModel: Model<Cliente>,

    @InjectModel(Credito.name)
    private creditoModel: Model<Credito>
  ){}

  async create(createClienteDto: CreateClienteDto): Promise<Cliente> {

    const verificarSiExisteclientePorDpi = await this.clienteModel.findOne({
      dpi: createClienteDto.dpi.trim(),
      ruta: createClienteDto.ruta
    });

    if(verificarSiExisteclientePorDpi) {
      throw new BadRequestException(`Ya existe el cliente ${verificarSiExisteclientePorDpi.alias} en la ruta`);
    }

    try {

      return await this.clienteModel.create(createClienteDto);

    } catch (error) {
      this.handleExceptions(error)
    }

  }

  async findAll({status = "true", ruta}: GlobalParams): Promise<Cliente[]> {
    
    const clientes = await this.clienteModel.find({
      ruta,
      status: isTrue(status)
    })
    .populate({
      path: "creditos"
    })


    return clientes;

  }

  async findByAdmin( { ruta }: GlobalParams ): Promise<Cliente[]> {

    return await this.clienteModel.find({
      ruta,
      state: true
    });

  }

  async getHistorial(id: string): Promise<Credito[]> {

    const creditos = await this.creditoModel.find({cliente: id});

    return creditos;

  }

  async findOne(termino: string) {
    
    const cliente = await this.clienteModel.findById(termino)
      .populate({
        path: "creditos",
        populate: {
          path: "pagos"
        }
      })

    if(!cliente) throw new NotFoundException("No existe el cliente");

    return cliente;

  }

  async update(id: string, updateClienteDto: UpdateClienteDto): Promise<boolean> {
    
    const cliente = await this.findOne(id);

    try {

      await cliente.updateOne(updateClienteDto, {new: true});

      return true;

    } catch (error) {

      this.handleExceptions(error)

    }

  }

  async remove(id: string) {
    const client = await this.findOne(id);
    await client.updateOne({state: false}, {new: true});

    return true;
  }

  private handleExceptions(error: any) {
    if(error.code === 11000){
      throw new BadRequestException("Ya existe este cliente")
    }

    this.logger.error(error);
    throw new InternalServerErrorException("Por favor revisa los logs")
  }
}
