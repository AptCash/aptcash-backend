import { Body, Controller, Get, Post } from '@nestjs/common';
import { AptosService } from './aptos.service';
import { SendTransactionDTO } from './dto/send-transaction.dto';

@Controller('aptos')
export class AptosController {
  constructor(private readonly aptosService: AptosService) {}

  @Get('account/data')
  getAccountData() {
    return this.aptosService.getAccountData();
  }

  @Post('send')
  sendTransaction(@Body() body: SendTransactionDTO) {
    return this.aptosService.sendTransaction(body);
  }
}
