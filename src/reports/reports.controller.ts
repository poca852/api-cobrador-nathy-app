import * as fs from 'fs';
import { Controller, Get, Query, Res } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { Auth } from '../auth/decorators';
import { ParseMongoIdPipe } from 'src/common/pipes/parse-mongo-id.pipe';
import { ValidRoles } from 'src/auth/interfaces';
import { Response } from 'express';

@Auth(ValidRoles.admin, ValidRoles.superAdmin)
@Controller('reports')
export class ReportsController {

  constructor(private readonly reportsService: ReportsService) {}

  @Get('backup')
  async getBackup(
    @Res() res: Response,
    @Query('empresa', ParseMongoIdPipe) empresa: string,
  ){

    const { file: path } = await this.reportsService.getBackup(empresa);
    const file = fs.readFileSync(path);
    res.header('Content-Type', 'text-csv');
    res.attachment('copia');
    res.send(file)
    
  }

  @Get('send-backup')
  async sendBackup(
    @Query('empresa', ParseMongoIdPipe) empresa: string,
  ){

    const { sentEmail } = await this.reportsService.getBackup(empresa);

    return sentEmail;
    
  }

}
