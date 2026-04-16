import { Payment } from './../../shared/interfaces';
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { StatesEnum } from '../interface/order.interface';

@Schema()
export class Order extends Document {
  @Prop()
  userId!: string;

  @Prop()
  startDate!: Date;

  @Prop()
  endDate!: Date;

  @Prop()
  propertyId!: string;

  @Prop({ type: Object })
  payment!: Payment;

  @Prop()
  isActive!: boolean;

  @Prop()
  isExternal?: boolean;

  @Prop({ type: String, enum: StatesEnum, default: StatesEnum.PENDIENTE })
  state!: StatesEnum;

}

export const OrderSchema = SchemaFactory.createForClass(Order);