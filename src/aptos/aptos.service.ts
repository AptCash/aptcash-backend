import {
  Account,
  Aptos,
  AptosConfig,
  Ed25519Account,
  Ed25519PrivateKey,
  Network,
} from '@aptos-labs/ts-sdk';
import { Injectable } from '@nestjs/common';

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

    return {
      accountAddress: accountAddress.toString(),
      privateKey: privateKey.toString(),
      publicKey: publicKey.toString(),
    };
  }
}
