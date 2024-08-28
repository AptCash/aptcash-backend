import {
  Account,
  Aptos,
  AptosConfig,
  Ed25519Account,
  Ed25519PrivateKey,
  Network,
} from '@aptos-labs/ts-sdk';
import { Injectable } from '@nestjs/common';
import { SendTransactionDTO } from './dto/send-transaction.dto';

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

    return committedTransaction;
  }
}
