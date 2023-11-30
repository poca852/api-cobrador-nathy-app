import fs, { existsSync } from 'fs';
import { join } from 'path';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

import { Credito } from '../credito/entities/credito.entity';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { MomentService } from '../common/plugins/moment/moment.service';

@Injectable()
export class ReportsService {

   constructor(
      @InjectModel(Credito.name)
      private creditoModel: Model<Credito>,

      @InjectModel(Empresa.name)
      private empresaModel: Model<Empresa>,

      private moment: MomentService,
   ) {}

   async getBackup(idEmpresa: string) {

      try {

         const empresa = await this.empresaModel.findById(idEmpresa);

         const creditos = await this.creditoModel.find({
            status: true,
            ruta: { $in: empresa.rutas }
         }).populate([
            { path: 'cliente'},
            { path: 'ruta' },
         ]);

         const path = await this.generarBackUp(empresa, creditos);
         return path;
         
      } catch (error) {

         console.log(error)
         throw new BadRequestException('No se pudo procesar la copia de seguridad, hable con el administrador del sistema')

      }

   }

   async generarBackUp(empresa: Empresa, creditos: Credito[]) {

      const fecha = this.moment.nowWithFormat('YYYY-MM-DD');
      const path = `static/backups/${empresa._id}_${fecha}.csv`;

      const csvWrite = createCsvWriter({
         path,
         header: [
            {id: 'ruta', title: 'RUTA'},
            {id: 'cliente', title: 'CLIENTE'},
            {id: 'valor_credito', title: 'PRESTADO'},
            {id: 'total_cuotas', title: 'CUOTAS'},
            {id: 'abonos', title: 'ABONOS'},
            {id: 'saldo', title: 'SALDO'},
            {id: 'valor_cuota', title: 'VALOR CUOTA'},
            {id: 'fecha_inicio', title: 'INICIO'},
            {id: 'ultimo_pago', title: 'FECHA ULTIMO PAGO'},
         ]
      })

      const records = [];

      for (const credito of creditos) {
         records.push({
            ruta: credito.ruta.nombre,
            cliente: credito.cliente.nombre,
            valor_credito: credito.valor_credito,
            total_cuotas: credito.total_cuotas,
            abonos: credito.abonos,
            saldo: credito.saldo,
            valor_cuota: credito.valor_cuota,
            fecha_inicio: credito.fecha_inicio,
            ultimo_pago: credito.ultimo_pago
         })
      }

      await csvWrite.writeRecords(records);

      const backup = join(__dirname, `../../static/backups/`, `${empresa._id}_${fecha}.csv`);

      if(!existsSync(backup)) {
         throw new BadRequestException('No se pudo crear el backup')
      }

      return backup;
   
   }

}
