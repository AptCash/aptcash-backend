import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AptosService } from './aptos.service';
import { SendTransactionDTO } from './dto/send-transaction.dto';

@Controller('aptos')
export class AptosController {
  constructor(private readonly aptosService: AptosService) {}

  @Get('account/data')
  getAccountData() {
    return this.aptosService.getAccountData();
  }

  @Get('convert/:fiat/:amount')
  async aptToUsd(
    @Param('fiat') fiat: 'usd' | 'inr',
    @Param('amount') amount: number,
  ) {
    return this.aptosService.aptToFiat({
      amountInApt: amount,
      to: fiat,
    });
  }

  @Post('send')
  sendTransaction(@Body() body: SendTransactionDTO) {
    return this.aptosService.sendTransaction(body);
  }
}
