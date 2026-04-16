import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({timestamps: true})
export class NotificationForUser {
  @Prop({ required: true })
  message!: string;
}

export const NotificationSchema = SchemaFactory.createForClass(NotificationForUser);