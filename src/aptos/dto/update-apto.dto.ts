import { PartialType } from '@nestjs/swagger';
import { CreateAptoDto } from './create-apto.dto';

export class UpdateAptoDto extends PartialType(CreateAptoDto) {}
