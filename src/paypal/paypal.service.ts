import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CheckoutDTO } from './dto/checkout.dto';
import * as braintree from 'braintree';
import { AptosService } from 'src/aptos/aptos.service';

type Environment = 'Sandbox' | 'Production';

@Injectable()
export class PaypalService {
  private gateway: braintree.BraintreeGateway;

  constructor(private readonly aptosService: AptosService) {
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

    try {
      const usdAmount = await this.aptosService.aptToFiat({
        amountInApt: aptAmount,
        to: 'usd',
      });

      console.log(`USD Amount: ${usdAmount}`);

      const payment = await this.gateway.transaction.sale({
        amount: usdAmount.toFixed(2).toString(),
        paymentMethodNonce: nonce,
        options: {
          submitForSettlement: true,
        },
      });

      // console.log(payment);

      if (!payment.success) {
        throw new InternalServerErrorException('Payment failed');
      }

      console.log(`Payment ID: ${payment.transaction.id}`);

      const txn = await this.aptosService.sendTransaction({
        amount: aptAmount,
        toAddress,
      });

      console.log(`Transaction ID: ${txn.hash}`);

      return { message: 'Payment successful', txHash: txn.hash };
    } catch (err) {
      console.log(err);

      throw new InternalServerErrorException(
        err?.message ?? 'Error processing payment',
      );
    }
  }
}
