import { OrderDTO } from "../../order/interface/order.interface";

export interface UserDTO {
  _id?: string;
  name: string;
  last_name: string;
  fullName: string;
  email: string;
  dni: number;
  phone: number;
  enabled: boolean;
  avatar?: string;
  orders?: OrderDTO[];
  dniFrontImage?: string;
  dniBackImage?: string; 
}

export interface UpdateUserDTO extends Partial<Omit<UserDTO, "_id">> {}
export interface CreateUserDTO extends Omit<UserDTO, "_id"> {}