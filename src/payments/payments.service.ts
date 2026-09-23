import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import { CreatePaymentSessionDto } from './dto/create-payment-session.dto';

@Injectable()
export class PaymentsService {
  private readonly stripe: Stripe;
  private readonly logger = new Logger('StripeWebhook'); // Permite imprimir en la consola de NestJS

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET as string, {
      apiVersion: '2026-08-26.dahlia',
    });
  }

  async createPaymentSession(createPaymentSessionDto: CreatePaymentSessionDto) {
    const { orderId, currency, items } = createPaymentSessionDto;
    
    const lineItems = items.map((item) => ({
      price_data: {
        currency: currency,
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.price * 100), 
      },
      quantity: item.quantity,
    }));

    // Creamos la sesión en Stripe
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: lineItems,
      payment_intent_data: {
        metadata: {
          orderId: orderId, // Requisito 
        },
      },
      // Las URLs salen del entorno, no del body
      success_url: process.env.STRIPE_SUCCESS_URL,
      cancel_url: process.env.STRIPE_CANCEL_URL,
    });

    // Devolvemos lo mínimo indispensable que pide el contrato
    return {
      id: session.id,
      url: session.url,
    };
  }

  webhook(rawBody: Buffer, signature: string) {
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_ENDPOINT_SECRET as string,
      );
    } catch (err) {
      throw new BadRequestException(`Firma inválida: ${err.message}`);
    }

    if (event.type === 'charge.succeeded') {
      const charge = event.data.object as Stripe.Charge;
      this.logger.log(`Pago completado. Order ID: ${charge.metadata.orderId}`);
    } else {
      this.logger.log(`Evento no manejado: ${event.type}`);
    }

    return { received: true };
  }
}