import { Module } from "@nestjs/common";
import { MercadoPagoController } from "./controller/mercadopago.controller";
import { MercadoPagoService } from "./service/mercadopago.service";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "../user/model/user.model";
import { Order, OrderSchema } from "../order/model/order.model";
import { NotificationService } from "../notification/notification.service";
import {PropertyService} from "../property/service/property.service";
import {Property, PropertySchema} from "../property/model/property.model";
import { NotificationForUser, NotificationSchema } from "@src/notification/model/notification.model";


@Module({
  imports: [
    MongooseModule.forFeature([
      {name: User.name, schema: UserSchema},
      {name: Order.name, schema: OrderSchema},
      {name: Property.name, schema: PropertySchema},
      { name: NotificationForUser.name, schema: NotificationSchema },
    ])
  ],
  controllers: [MercadoPagoController],
  providers: [MercadoPagoService, NotificationService, PropertyService],
})

export class MercadoPagoModule {}