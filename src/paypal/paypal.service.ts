import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CheckoutDTO } from './dto/checkout.dto';
import * as braintree from 'braintree';

type Environment = 'Sandbox' | 'Production';

@Injectable()
export class PaypalService {
  private gateway: braintree.BraintreeGateway;

  constructor() {
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
      // TODO: Calculate the amount based on the aptAmount
      const payment = await this.gateway.transaction.sale({
        amount: '10',
        paymentMethodNonce: nonce,
        options: {
          submitForSettlement: true,
        },
      });

      if (!payment.success) {
        throw new InternalServerErrorException('Payment failed');
      }

      // TODO: Send APT to the toAddress
      return { message: 'Payment successful' };
    } catch (err) {
      console.log(err);

      throw new InternalServerErrorException(
        err?.message ?? 'Error processing payment',
      );
    }
  }
}
