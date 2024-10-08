import { IsString, IsNumber } from 'class-validator';

export class CheckoutDTO {
  @IsString()
  nonce: string;

  @IsString()
  toAddress: string;

  @IsNumber()
  aptAmount: number;
}
