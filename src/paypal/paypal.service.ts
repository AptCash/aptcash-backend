import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreatePaypalDto } from './dto/create-paypal.dto';
import { UpdatePaypalDto } from './dto/update-paypal.dto';
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
}
