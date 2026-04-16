import { Order } from "../model/order.model";
import { OrderDTO } from "../interface/order.interface";
import { toString } from "../../shared/functions";

export class OrderMapper {
  static toDTO(order: Order): OrderDTO {
    const plainOrder = typeof order.toObject === "function" ? order.toObject() : order;
    const { _id, ...rest } = plainOrder as OrderDTO & { _id?: unknown };

    return {
      ...(rest as Omit<OrderDTO, "_id">),
      _id: _id !== undefined ? toString(_id) : undefined,
    };
  }

  static toDTOs(orders: Order[]): OrderDTO[] {
    return orders.map(order => this.toDTO(order));
  }
}

