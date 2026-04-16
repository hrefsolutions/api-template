import { Module } from "@nestjs/common";
import { NotificationService } from "../notification/notification.service";
import { NotificationController } from "./notification.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { NotificationForUser, NotificationSchema } from "@src/notification/model/notification.model";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: NotificationForUser.name, schema: NotificationSchema }
    ]),
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService]
})
export class NotificationModule {}