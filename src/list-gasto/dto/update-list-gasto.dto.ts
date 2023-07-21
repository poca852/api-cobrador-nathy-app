import { PartialType } from '@nestjs/mapped-types';
import { CreateListGastoDto } from './create-list-gasto.dto';

export class UpdateListGastoDto extends PartialType(CreateListGastoDto) {}
