import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Extras, Ubication } from "../../shared/interfaces";
import { Document } from "mongoose";

@Schema()
export class Property extends Document {
  @Prop()
  name!: string;

  @Prop()
  price!: number;

  @Prop()
  address!: string;

  @Prop()
  description!: string;

  @Prop()
  propertyType!: "casa" | "quinta" | "departamento" | "interno";
  
  @Prop({ type: Object })
  extras!: Extras;

  @Prop()
  currency!: "USD" | "ARS";

  @Prop()
  coverImg!: string;

  @Prop()
  img!: string[];

  @Prop()
  coordinates!: number[];

  @Prop({ type: Object })
  ubication!: Ubication
}

export const PropertySchema = SchemaFactory.createForClass(Property);