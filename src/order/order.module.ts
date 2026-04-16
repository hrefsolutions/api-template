import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Order, OrderSchema } from "./model/order.model";
import { OrderController } from "./controller/order.controller";
import { OrderService } from "./service/order.service";
import { User, UserSchema } from "../user/model/user.model";
import { NotificationService } from "../notification/notification.service";
import { UserModule } from "../user/user.module";
import { NotificationForUser, NotificationSchema } from "../notification/model/notification.model";
import { Property, PropertySchema } from "../property/model/property.model";
import { PropertyService } from "../property/service/property.service";

@Module({
  imports:[
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: User.name, schema: UserSchema },
      { name: NotificationForUser.name, schema: NotificationSchema },
      { name: Property.name, schema: PropertySchema }
    ]),
    UserModule
  ],
  controllers: [OrderController],
  providers: [OrderService, NotificationService, PropertyService],
  exports: [OrderService]
})

export class OrderModule {}