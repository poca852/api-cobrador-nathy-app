import { PartialType } from '@nestjs/mapped-types';
import { CreateRetiroDto } from './create-retiro.dto';

export class UpdateRetiroDto extends PartialType(CreateRetiroDto) {}
