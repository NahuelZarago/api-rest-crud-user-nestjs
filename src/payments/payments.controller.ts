import { Controller, Post, Body, Get, Req, Headers, HttpCode } from '@nestjs/common';
import type { Request } from 'express';
import { PaymentsService } from './payments.service';
import { CreatePaymentSessionDto } from './dto/create-payment-session.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-payment-session')
  createPaymentSession(@Body() createPaymentSessionDto: CreatePaymentSessionDto) {
    return this.paymentsService.createPaymentSession(createPaymentSessionDto);
  }

  @Get('success')
  success() {
    return { ok: true, message: 'Payment successful' };
  }

  @Get('cancel')
  cancel() {
    return { ok: false, message: 'Payment cancelled' };
  }

  @Post('webhook')
  @HttpCode(200) // Stripe requiere un 200 OK, no el 201 Created que da Nest por defecto en los POST
  webhook(
    @Req() req: Request,
    @Headers('stripe-signature') signature: string,
  ) {
    // Le pasamos el rawBody que habilitamos en main.ts y la firma de Stripe
    return this.paymentsService.webhook(req['rawBody'], signature);
  }
}