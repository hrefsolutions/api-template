import { Payment } from "../../shared/interfaces";

export interface OrderDTO {
  _id?: string;
  userId: string;
  startDate: Date;
  endDate: Date;
  propertyId: string;
  payment: Payment;
  isActive?: boolean;
  isExternal?: boolean;
  state: StatesEnum;
}

export enum StatesEnum {
  PENDIENTE= "pendiente",
  ACEPTADO= "aceptado",
  RECHAZADO= "rechazado",
  CANCELADO= "cancelado"
}

export interface CreateOrderDTO extends Omit<OrderDTO, "userId"> {}
export interface UpdateOrderDTO extends Partial<OrderDTO> {}