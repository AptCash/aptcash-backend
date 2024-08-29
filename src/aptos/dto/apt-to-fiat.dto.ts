import { IsString, IsNumber } from 'class-validator';

export class AptToFiatDTO {
  @IsNumber()
  amountInApt: number;

  @IsString()
  to: 'usd' | 'inr';
}
