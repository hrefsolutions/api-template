import { Module } from '@nestjs/common';
import { UsuariosService } from './service/user.service';
import { User, UserSchema } from './model/user.model';
import { MongooseModule } from '@nestjs/mongoose';
import { UsuariosController } from './controller/user.controller';
import { UserRepository } from "@src/user/repository/user.repository";

@Module({
  imports: [
    MongooseModule.forFeature([
      {name: User.name, schema: UserSchema},
    ]),
  ],
  providers: [UsuariosService, UserRepository],
  controllers: [UsuariosController],
  exports: [UsuariosService]
})
export class UserModule {}
