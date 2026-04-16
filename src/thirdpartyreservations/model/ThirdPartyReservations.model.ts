import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({timestamps: true})
export class ThirdPartyReservation extends Document{
  @Prop()
  name!: string;
  
  @Prop()
  value!: string;
}

export const ThirdPartyReservationSchema = SchemaFactory.createForClass(ThirdPartyReservation);