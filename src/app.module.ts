import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [
    ConfigModule.forRoot(), // Esto carga tu archivo .env automáticamente
    PaymentsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}