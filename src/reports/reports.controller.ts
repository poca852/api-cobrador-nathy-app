import { Controller, Get, Query, Res } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { Auth } from '../auth/decorators';
import { ParseMongoIdPipe } from 'src/common/pipes/parse-mongo-id.pipe';
import { Response } from 'express';

@Auth()
@Controller('reports')
export class ReportsController {

  constructor(private readonly reportsService: ReportsService) {}

  @Get('backup')
  async getBackup(
    @Res() res: Response,
    @Query('empresa', ParseMongoIdPipe) empresa: string
  ){

    const path = await this.reportsService.getBackup(empresa);
    res.sendFile(path);
    
  }

}
