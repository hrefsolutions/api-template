import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserAdmin, UserAdminSchema } from './model/useradmin.model';
import { UserAdminService } from './service/useradmin.service';
import { UserAdminController } from './controller/useradmin.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      {name: UserAdmin.name, schema: UserAdminSchema},
    ])
  ],
  providers: [UserAdminService],
  controllers: [UserAdminController],
  exports: [UserAdminService]
})
export class UserAdminModule {}
