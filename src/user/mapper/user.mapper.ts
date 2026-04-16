import { User } from "@src/user/model/user.model";
import { UserDTO } from "@src/user/interface/user.interface";
import {toString} from "funciones-basicas";


export class UserMapper {
  static toDTO(user: User): UserDTO {
    return {
      _id: toString(user._id),
      name: user.name,
      last_name: user.last_name,
      fullName: user.fullName,
      email: user.email,
      dni: user.dni,
      phone: user.phone,
      avatar: user.avatar,
      enabled: user.enabled,
      orders: user.orders,
      dniFrontImage: user.dniFrontImage,
      dniBackImage: user.dniBackImage
    }
  }

  static toDTOs(users: User[]): UserDTO[] {
    return users.map(user => this.toDTO(user));
  }
}