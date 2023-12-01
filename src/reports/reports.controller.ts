import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { Auth } from '../auth/decorators';
import { ParseMongoIdPipe } from 'src/common/pipes/parse-mongo-id.pipe';
import { ValidRoles } from 'src/auth/interfaces';

@Auth(ValidRoles.admin, ValidRoles.superAdmin)
@Controller('reports')
export class ReportsController {

  constructor(private readonly reportsService: ReportsService) {}

  @Get('backup')
  async getBackup(
    // @Res() res: Response,
    @Query('empresa', ParseMongoIdPipe) empresa: string,
    @Query('to') to: string[],
  ){

    const { file, sentEmail } = await this.reportsService.getBackup(empresa, to);
    // const csv = fs.readFileSync(file);
    // res.header('Content-Type', 'text/csv');
    // res.attachment('Copia de seguridad')
    return sentEmail;
    
  }

}
