import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Property, PropertySchema} from "./model/property.model";
import { PropertyController } from "./controller/property.controller";
import { PropertyService } from "./service/property.service";
import { Order, OrderSchema } from "../order/model/order.model";

@Module({
  imports:[
    MongooseModule.forFeature([
      { name: Property.name, schema: PropertySchema },
      { name: Order.name, schema: OrderSchema }
    ])
  ],
  controllers: [PropertyController],
  providers: [PropertyService],
  exports: [PropertyService]
})

export class PropertyModule {}