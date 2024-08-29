import { Module } from '@nestjs/common';
import { PaypalService } from './paypal.service';
import { PaypalController } from './paypal.controller';
import { AptosService } from 'src/aptos/aptos.service';
import { PrismaService } from 'src/prisma.service';
import { TransactionsService } from 'src/transactions/transactions.service';

@Module({
  controllers: [PaypalController],
  providers: [PaypalService, AptosService, PrismaService, TransactionsService],
})
export class PaypalModule {}
