import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PaypalModule } from './paypal/paypal.module';
import { AptosModule } from './aptos/aptos.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'),
    }),
    PaypalModule,
    AptosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
