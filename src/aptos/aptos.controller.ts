import { Controller, Get } from '@nestjs/common';
import { AptosService } from './aptos.service';

@Controller('aptos')
export class AptosController {
  constructor(private readonly aptosService: AptosService) {}

  @Get()
  getAccountData() {
    return this.aptosService.getAccountData();
  }
}
