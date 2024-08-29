import { Module } from '@nestjs/common';
import { PaypalService } from './paypal.service';
import { PaypalController } from './paypal.controller';
import { AptosService } from 'src/aptos/aptos.service';

@Module({
  controllers: [PaypalController],
  providers: [PaypalService, AptosService],
})
export class PaypalModule {}
