import { Injectable, ConflictException, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Order } from "../model/order.model";
import { OrderDTO, StatesEnum, UpdateOrderDTO } from "../interface/order.interface";
import { Cron, CronExpression } from "@nestjs/schedule";
import { User } from "../../user/model/user.model";
import {
  MINIMUM_STAY_DAYS,
  calculateStayLengthInDays,
  normalizeDateToEndOfDay,
  normalizeDateToStartOfDay,
  rangesOverlap,
  toString
} from "../../shared/functions";
import { OrderMapper } from "../mapper/order.mapper";

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);
  
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<Order>,
    @InjectModel(User.name) private readonly userModel: Model<User>
  ) {}

  async findAllOrders(): Promise<OrderDTO[]> {
    const orders = await this.orderModel.find();
    return OrderMapper.toDTOs(orders);
  }

  async getOrder(orderId: string): Promise<OrderDTO> {
    const order = await this.orderModel.findById(orderId);
    if (!order) {
      throw new ConflictException(`Order ${orderId} not found`);
    }
    return OrderMapper.toDTO(order);
  }

  async createOrder(order: OrderDTO): Promise<void> {
    const startDate = new Date(order.startDate);
    const endDate = new Date(order.endDate);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      throw new ConflictException('Las fechas proporcionadas no son válidas.');
    }

    if (startDate > endDate) {
      throw new ConflictException('La fecha de inicio no puede ser posterior a la fecha de fin.');
    }

    const stayLengthInDays = calculateStayLengthInDays(startDate, endDate);
    if (Number.isNaN(stayLengthInDays)) {
      throw new ConflictException('Las fechas proporcionadas no son válidas.');
    }

    if (stayLengthInDays < MINIMUM_STAY_DAYS) {
      throw new ConflictException(`La reserva mínima es de ${MINIMUM_STAY_DAYS} días.`);
    }

    await this.ensurePropertyAvailability(order.propertyId, startDate, endDate);

    const createdOrder = await this.orderModel.create(order);
    createdOrder.state = StatesEnum.PENDIENTE;
    await createdOrder.save();
  }

  async updateOrder(orderId: string, order: UpdateOrderDTO): Promise<OrderDTO> {
    const currentOrder = await this.orderModel.findById(orderId);
    if (!currentOrder) {
      throw new ConflictException(`Order ${orderId} not found`);
    }

    const startDate = new Date(order.startDate ?? currentOrder.startDate);
    const endDate = new Date(order.endDate ?? currentOrder.endDate);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      throw new ConflictException('Las fechas proporcionadas no son válidas.');
    }

    if (startDate > endDate) {
      throw new ConflictException('La fecha de inicio no puede ser posterior a la fecha de fin.');
    }

    const stayLengthInDays = calculateStayLengthInDays(startDate, endDate);
    if (Number.isNaN(stayLengthInDays)) {
      throw new ConflictException('Las fechas proporcionadas no son válidas.');
    }

    if (stayLengthInDays < MINIMUM_STAY_DAYS) {
      throw new ConflictException(`La reserva mínima es de ${MINIMUM_STAY_DAYS} días.`);
    }

    const propertyId = order.propertyId ?? currentOrder.propertyId;
    await this.ensurePropertyAvailability(propertyId, startDate, endDate, orderId);

    currentOrder.set(order);
    const updatedOrder = await currentOrder.save();
    return OrderMapper.toDTO(updatedOrder);
  }

  async deleteOrder(orderId: string): Promise<void> {
    const deletedOrder = await this.orderModel.findByIdAndDelete(orderId);
    if (!deletedOrder) {
      throw new ConflictException(`Order ${orderId} not found`);
    }
  }

  async disableOrder(orderId: string, userId: string): Promise<void> {
    const updatedOrder = await this.orderModel.findByIdAndUpdate(
      orderId,
      { isActive: false },
      { returnDocument: "after" }
    );
    if (!updatedOrder) {
      throw new ConflictException(`Order ${orderId} not found`);
    }

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new ConflictException(`User ${userId} not found`);
    }

    const orderIndex = user.orders.findIndex(order => toString(order._id) === orderId);
    if (orderIndex === -1) {
      throw new ConflictException(`Order ${orderId} not found in user ${userId}`);
    }
    
    user.orders[orderIndex] = OrderMapper.toDTO(updatedOrder);
    await user.save();
  }

  private async ensurePropertyAvailability(
    propertyId: string,
    startDate: Date,
    endDate: Date,
    excludeOrderId?: string
  ): Promise<void> {
    const desiredStart = normalizeDateToStartOfDay(startDate);
    const desiredEnd = normalizeDateToEndOfDay(endDate);

    const query: {
      propertyId: string;
      isActive: boolean;
      _id?: { $ne: Types.ObjectId };
    } = {
      propertyId,
      isActive: true,
    };

    if (excludeOrderId) {
      query._id = { $ne: new Types.ObjectId(excludeOrderId) };
    }

    const activeOrders = await this.orderModel.find(query);

    for (const activeOrder of activeOrders) {
      const activeStart = normalizeDateToStartOfDay(activeOrder.startDate);
      const activeEnd = normalizeDateToEndOfDay(activeOrder.endDate);

      if (rangesOverlap(desiredStart, desiredEnd, activeStart, activeEnd)) {
        throw new ConflictException('No hay disponibilidad para las fechas seleccionadas.');
      }
    }
  }

  async getDollarRate(): Promise<number> {
    try {
      const response = await fetch('https://dolarapi.com/v1/dolares/blue');
      const data = await response.json();
      return data.venta;
    } catch (error) {
      console.error('Fallo al obtener la cotización del dólar:', error);
      return 1200;
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async handleCron() {
    this.logger.debug("Llamada cuando la hora actual es 10 AM");
    
    const TODAY = new Date();
    TODAY.setHours(0, 0, 0, 0);

    const orders = await this.orderModel.find({
      endDate: {
        $gte: TODAY,
        $lt: new Date(TODAY.getTime() + 24 * 60 * 60 * 1000)
      },
      isActive: true
    });

    for (const order of orders) {
      order.isActive = false;
      await order.save();
      this.logger.debug(`Orden con id ${order._id} fue desactivada`);
    }
  }
}
