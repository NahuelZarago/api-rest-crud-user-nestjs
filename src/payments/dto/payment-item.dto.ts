import { IsString, IsNumber, IsPositive, IsInt } from 'class-validator';

export class PaymentItemDto {
  @IsString()
  name: string;

  @IsNumber()
  @IsPositive()
  price: number; // Stripe lo recibirá en centavos luego

  @IsInt()
  @IsPositive()
  quantity: number;
}