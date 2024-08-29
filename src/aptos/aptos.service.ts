import {
  Account,
  Aptos,
  AptosConfig,
  Ed25519Account,
  Ed25519PrivateKey,
  Network,
} from '@aptos-labs/ts-sdk';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { SendTransactionDTO } from './dto/send-transaction.dto';
import axios, { AxiosError } from 'axios';
import { AptToFiatDTO } from './dto/apt-to-fiat.dto';

@Injectable()
export class AptosService {
  private readonly aptos: Aptos;
  private readonly account: Ed25519Account;

  constructor() {
    const config = new AptosConfig({ network: Network.TESTNET });
    this.aptos = new Aptos(config);

    this.account = Account.fromPrivateKey({
      privateKey: new Ed25519PrivateKey(process.env.APTOS_PRIVATE_KEY),
    });
  }

  async getAccountData() {
    const { accountAddress, privateKey, publicKey } = this.account;

    // const transaction = await this.aptos.fundAccount({
    //   accountAddress: this.account.accountAddress,
    //   amount: 50000000,
    // });

    return {
      accountAddress: accountAddress.toString(),
      privateKey: privateKey.toString(),
      publicKey: publicKey.toString(),
    };
  }

  async sendTransaction({ toAddress, amount }: SendTransactionDTO) {
    const transaction = await this.aptos.transaction.build.simple({
      sender: this.account.accountAddress,
      data: {
        function: '0x1::aptos_account::transfer',
        functionArguments: [toAddress, (amount * 100_000_000).toString()],
      },
    });

    const senderAuthenticator = this.aptos.transaction.sign({
      signer: this.account,
      transaction,
    });

    const committedTransaction = await this.aptos.transaction.submit.simple({
      transaction,
      senderAuthenticator,
    });

    const executedTransaction = await this.aptos.waitForTransaction({
      transactionHash: committedTransaction.hash,
    });

    return executedTransaction;
  }

  async getAptosPrice() {
    try {
      const res = await axios.get(
        `https://api.coingecko.com/api/v3/simple/price?ids=aptos&vs_currencies=usd,inr&x_cg_demo_api_key=${process.env.COIN_GECKO_API_KEY}`,
      );

      return res.data as {
        aptos: {
          usd: number;
          inr: number;
        };
      };
    } catch (e: any) {
      const error = e as AxiosError;
      throw new InternalServerErrorException(
        error.response.data ?? 'Failed to get aptos price',
      );
    }
  }

  async aptToFiat({ amountInApt, to }: AptToFiatDTO) {
    const {
      aptos: { inr, usd },
    } = await this.getAptosPrice();

    if (to === 'usd') {
      return amountInApt * usd;
    } else if (to === 'inr') {
      return amountInApt * inr;
    }

    throw new BadRequestException('Invalid fiat currency');
  }
}
