import { Injectable } from '@nestjs/common';
import { CreateAptoDto } from './dto/create-apto.dto';
import { UpdateAptoDto } from './dto/update-apto.dto';

@Injectable()
export class AptosService {
  create(createAptoDto: CreateAptoDto) {
    return 'This action adds a new apto';
  }

  findAll() {
    return `This action returns all aptos`;
  }

  findOne(id: number) {
    return `This action returns a #${id} apto`;
  }

  update(id: number, updateAptoDto: UpdateAptoDto) {
    return `This action updates a #${id} apto`;
  }

  remove(id: number) {
    return `This action removes a #${id} apto`;
  }
}
