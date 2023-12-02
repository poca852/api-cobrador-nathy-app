import * as fs from 'fs';
import { join } from 'path';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transporter, createTransport } from 'nodemailer';
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

import { Credito } from '../credito/entities/credito.entity';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { MomentService } from '../common/plugins/moment/moment.service';
import { ConfigService } from '@nestjs/config';

export interface SendEmailOptions {
   to: string | string[];
   subject: string;
   htmlBody: string;
   attachments?: Attachment[];
}

interface Attachment {
   filename: string;
   content: Buffer;
}

@Injectable()
export class ReportsService {

   private transporter: Transporter = createTransport({
      service: this.configService.get('MAILER_SERVICE'),
      auth: {
         user: this.configService.get('MAILER_EMAIL'),
         pass: this.configService.get('MAILER_SECRET_KEY')
      }
   })

   constructor(
      @InjectModel(Credito.name)
      private creditoModel: Model<Credito>,

      @InjectModel(Empresa.name)
      private empresaModel: Model<Empresa>,

      private moment: MomentService,
      private configService: ConfigService,
   ) {}

   async sendEmail(options: SendEmailOptions): Promise<boolean> {

      const { to, subject, htmlBody, attachments } = options;

      try {
         
         const sendInformation = await this.transporter.sendMail({
            to,
            subject, 
            html: htmlBody,
            attachments
         })

         return true;

      } catch (error) {

         return false;

      }

   }

   async sendBackUpViaEmail(to: string | string[], file: Buffer, empresa: Empresa){

      const subject = `Copia de seguridad de ${empresa.name}`;
      const htmlBody = `
         <h3>Copia de seguridad del sistema - ${empresa.name}</h3>
         <p>Descarga el archivo excel</p>
      `;

      const attachments: Attachment[] = [
         {
            filename: 'backup.csv',
            content: file
         }
      ]

      return await this.sendEmail({
         to, subject, attachments, htmlBody
      })
   }

   async getBackup(idEmpresa: string, to?: string) {

      try {

         const empresa = await this.empresaModel.findById(idEmpresa);

         const creditos = await this.creditoModel.find({
            status: true,
            ruta: { $in: empresa.rutas }
         }).populate([
            { path: 'cliente'},
            { path: 'ruta' },
         ]);

         const path = await this.generarBackUp(empresa, creditos, to);
         return path;
         
      } catch (error) {

         console.log(error)
         throw new BadRequestException('No se pudo procesar la copia de seguridad, hable con el administrador del sistema')

      }

   }

   async generarBackUp(empresa: Empresa, creditos: Credito[], to?: string) {

      const fecha = this.moment.nowWithFormat('YYYY-MM-DD');
      const path = `static/backups/${empresa._id}_${fecha}.csv`;

      const csvWrite = createCsvWriter({
         path,
         header: [
            {id: 'ruta', title: 'RUTA'},
            {id: 'cliente', title: 'CLIENTE'},
            {id: 'telefono', title: 'TELEFONO'},
            {id: 'direccion', title: 'DIRECCION'},
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
            telefono: credito.cliente.telefono,
            direccion: `${credito.cliente.direccion} - ${credito.cliente.ciudad}`,
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

      if(!fs.existsSync(backup)) {
         throw new BadRequestException('No se pudo crear el backup')
      }

      const file = fs.readFileSync(backup);
      
      let sentEmail = false;

      if(to){
         sentEmail = await this.sendBackUpViaEmail(to, file, empresa)
      }

      return {
         file: backup,
         sentEmail
      }
   
   }

}
