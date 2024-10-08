import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CheckoutDTO } from './dto/checkout.dto';
import * as braintree from 'braintree';
import { AptosService } from 'src/aptos/aptos.service';
import { TransactionsService } from 'src/transactions/transactions.service';
import { PrismaService } from 'src/prisma.service';

type Environment = 'Sandbox' | 'Production';

@Injectable()
export class PaypalService {
  private gateway: braintree.BraintreeGateway;

  constructor(
    private readonly aptosService: AptosService,
    private readonly transactionsService: TransactionsService,
    private readonly prisma: PrismaService,
  ) {
    this.gateway = new braintree.BraintreeGateway({
      environment:
        braintree.Environment[process.env.BRAINTREE_ENVIRONMENT as Environment],
      merchantId: process.env.BRAINTREE_MERCHANT_ID as string,
      publicKey: process.env.BRAINTREE_PUBLIC_KEY as string,
      privateKey: process.env.BRAINTREE_PRIVATE_KEY as string,
    });
  }

  async getClientToken() {
    try {
      const res = await this.gateway.clientToken.generate({});

      return res.clientToken;
    } catch (err) {
      console.log(err);

      throw new InternalServerErrorException(
        'Error generating braintree client token',
      );
    }
  }

  async processTransaction({ nonce, toAddress, aptAmount }: CheckoutDTO) {
    if (!nonce || !toAddress || !aptAmount) {
      throw new BadRequestException('Missing required fields');
    }

    if (aptAmount <= 0 || isNaN(aptAmount) || aptAmount >= 0.05) {
      throw new BadRequestException(
        'For testing purposes, we have restricted the amount between 0.01-0.05',
      );
    }

    const userId = '9e363e6b-5358-452b-98fa-617fb1e496c3';

    try {
      // Converted Aptos to USD
      const fiatAmount = await this.aptosService.aptToFiat({
        amountInApt: aptAmount,
        to: 'usd',
      });

      // Created new Transaction in database
      const transaction = await this.transactionsService.create({ userId });

      // Processed Payment
      const payment = await this.gateway.transaction.sale({
        amount: fiatAmount.toFixed(2).toString(),
        paymentMethodNonce: nonce,
        options: {
          submitForSettlement: true,
        },
      });

      // Add FiatPayment details to Transaction
      const fiatPayment = await this.prisma.fiatPayment.create({
        data: {
          gatewayId: payment.transaction.id,
          amountPaid: parseFloat(payment.transaction.amount),
          fiatCurrency: payment.transaction.currencyIsoCode,
          transactionId: transaction.id,
          status: payment.success ? 'COMPLETED' : 'FAILED',
          paidAt: new Date(payment.transaction.createdAt),
        },
      });

      if (!payment.success) {
        throw new InternalServerErrorException('Payment failed');
      }

      console.log(`Payment ID: ${payment.transaction.id}`);

      // Execute Aptos Txn
      const txn = await this.aptosService.sendTransaction({
        amount: aptAmount,
        toAddress,
      });

      // Save AptosPayment details to Transaction
      const aptosPayment = await this.prisma.aptosPayment.create({
        data: {
          txHash: txn.hash,
          aptosAmount: aptAmount,
          conversionCurrency: payment.transaction.currencyIsoCode,
          conversionRate: fiatAmount / aptAmount,
          transactionId: transaction.id,
        },
      });

      console.log(`Transaction ID: ${txn.hash}`);

      // Mark Transaction as complete
      await this.prisma.transaction.update({
        where: {
          id: transaction.id,
        },
        data: {
          status: 'COMPLETED',
        },
      });

      return {
        message: 'Payment processed successfully',
        id: transaction.id,
        gatewayId: fiatPayment.gatewayId,
        txHash: txn.hash,
      };
    } catch (err) {
      console.log(err);

      throw new InternalServerErrorException(
        err?.message ?? 'Error processing payment',
      );
    }
  }
}
