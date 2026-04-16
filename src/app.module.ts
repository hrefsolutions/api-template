import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { UserAdminModule } from './useradmin/useradmin.module';
import { OrderModule } from './order/order.module';
import { PropertyModule } from './property/property.module';
import { MercadoPagoModule } from './mercadopago/mercadopago.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ThirdPartyReservationsModule } from './thirdpartyreservations/ThirdPartyReservations.module';
import { NotificationModule } from './notification/notification.module';
import { SiteConfigModule } from './siteconfig/siteconfig.module';


@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_DEB_URI!, {
      dbName: process.env.NODE_ENV === "development" ? 'develop' : 'production'
    }),
    AuthModule,
    UserModule,
    UserAdminModule,
    OrderModule,
    PropertyModule,
    MercadoPagoModule,
    ThirdPartyReservationsModule,
    ScheduleModule.forRoot(),
    NotificationModule,
    SiteConfigModule
  ],
  controllers:[AppController],
  providers: [],
})
export class AppModule {}
