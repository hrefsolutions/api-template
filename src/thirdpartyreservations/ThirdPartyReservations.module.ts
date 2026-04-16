import { Module } from "@nestjs/common";
import { MongooseModule } from '@nestjs/mongoose';
import { OrderService } from "../order/service/order.service";
import { ThirdPartyReservationsService } from "./service/ThirdPartyReservations.service";
import { ThirdPartyReservationController } from "./controller/ThirdPartyReservations.controller";
import { Order, OrderSchema } from "../order/model/order.model";
import { User, UserSchema } from "../user/model/user.model";
import { PropertyService } from "../property/service/property.service";
import { Property, PropertySchema } from "../property/model/property.model";
import { ThirdPartyReservation, ThirdPartyReservationSchema } from "./model/ThirdPartyReservations.model";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ThirdPartyReservation.name, schema: ThirdPartyReservationSchema },
      { name: Order.name, schema: OrderSchema },
      { name: User.name, schema: UserSchema },
      { name: Property.name, schema: PropertySchema },

    ]),
  ],
  controllers: [ThirdPartyReservationController],
  providers: [ThirdPartyReservationsService, OrderService, PropertyService],
  exports: [ThirdPartyReservationsService]
})
export class ThirdPartyReservationsModule {}
