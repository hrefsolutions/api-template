import { ConflictException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Property } from "../model/property.model";
import { Model } from "mongoose";
import { PropertyDTO, UpdatePropertyDTO } from "../interface/property.interface";
import { Order } from "../../order/model/order.model";
import {
  MINIMUM_STAY_DAYS,
  calculateStayLengthInDays,
  normalizeDateToEndOfDay,
  normalizeDateToStartOfDay,
  rangesOverlap,
  toString
} from "../../shared/functions";

@Injectable()
export class PropertyService {
  constructor(
    @InjectModel(Property.name) private readonly propertyModel: Model<Property>,
    @InjectModel(Order.name) private readonly orderModel: Model<Order>,
  ) { }

  async findAllProperties(): Promise<PropertyDTO[]> {
    return await this.propertyModel.find();
  }

  async getProperty(propertyId: string): Promise<PropertyDTO> {
    const property: PropertyDTO | null = await this.propertyModel.findById(propertyId);
    if (!property) throw new ConflictException("No se puede acceder a la información sobre la propiedad buscada");
    return property;
  }

  async createProperty(order: PropertyDTO): Promise<void> {
    const createdProperty = new this.propertyModel(order);
    await createdProperty.save();
  }

  async updateProperty(propertyId: string, property: UpdatePropertyDTO): Promise<PropertyDTO> {
    const updatedProperty: PropertyDTO | null = await this.propertyModel.findByIdAndUpdate(propertyId, property, {
      returnDocument: "after",
    });
    if (!updatedProperty) {
      throw new ConflictException(`Property ${property._id} not found`);
    }
    return updatedProperty;
  }

  async deleteProperty(propertyId: string): Promise<void> {
    const deletedProperty: PropertyDTO | null = await this.propertyModel.findByIdAndDelete(propertyId);
    if (!deletedProperty) {
      throw new ConflictException(`Property ${propertyId} not found`);
    }
    return;
  }
  async getAvailability(propertyId: string, startDate: string, endDate: string) {
    const IS_ACTIVE = true;
    const activeOrders = await this.findOrders(propertyId, IS_ACTIVE);

    const rawStartDate = new Date(startDate);
    const rawEndDate = new Date(endDate);

    if (Number.isNaN(rawStartDate.getTime()) || Number.isNaN(rawEndDate.getTime())) {
      return { message: 'Las fechas proporcionadas no son válidas.', status: 400 };
    }

    // Validar las restricciones de fecha para el pedido actual
    const orderStartDate = normalizeDateToStartOfDay(rawStartDate);
    const orderEndDate = normalizeDateToEndOfDay(rawEndDate);

    if (orderStartDate > orderEndDate) {
      return { message: 'La fecha de inicio no puede ser posterior a la fecha de fin.', status: 400 };
    }

    const stayLengthInDays = calculateStayLengthInDays(rawStartDate, rawEndDate);
    if (Number.isNaN(stayLengthInDays)) {
      return { message: 'Las fechas proporcionadas no son válidas.', status: 400 };
    }

    if (stayLengthInDays < MINIMUM_STAY_DAYS) {
      return { message: `La reserva mínima es de ${MINIMUM_STAY_DAYS} días.`, status: 400 };
    }

    // Comprobación de fechas pisadas en ordenes activas
    for (const activeOrder of activeOrders) {
      const activeOrderStartDate = normalizeDateToStartOfDay(activeOrder.startDate);
      const activeOrderEndDate = normalizeDateToEndOfDay(activeOrder.endDate);

      if (rangesOverlap(orderStartDate, orderEndDate, activeOrderStartDate, activeOrderEndDate)) {
        return { message: 'No hay disponibilidad para las fechas seleccionadas.', status: 200 };
      }
    }
    // Si no hay resultados en el for, devolvemos que hay disponibiilidad 
    return { message: 'Disponibilidad confirmada para las fechas seleccionadas.', status: 200 };
  }

  async getAvailableProperties(startDate: Date, endDate: Date): Promise<string[]> {
    const orderStartDate = new Date(startDate);
    const orderEndDate = new Date(endDate);

    // Validar las restricciones de fecha para el pedido actual
    if (orderStartDate > orderEndDate) {
      throw new Error('La fecha de inicio no puede ser posterior a la fecha de fin.');
    }

    const stayLengthInDays = calculateStayLengthInDays(orderStartDate, orderEndDate);
    if (Number.isNaN(stayLengthInDays)) {
      throw new Error('Las fechas proporcionadas no son válidas.');
    }

    if (stayLengthInDays < MINIMUM_STAY_DAYS) {
      throw new Error(`La reserva mínima es de ${MINIMUM_STAY_DAYS} días.`);
    }

    // Buscar órdenes activas que se superpongan con el rango de fechas proporcionado
    const overlappingOrders = await this.orderModel.find({
      isActive: true,
      $or: [
        {
          startDate: { $lte: orderEndDate },
          endDate: { $gte: orderStartDate },
        },
        {
          startDate: { $lt: orderStartDate },
          endDate: { $gt: orderEndDate },
        }
      ],
    }).exec();

    // Extraer los IDs de las propiedades que están reservadas
    const reservedPropertyIds = overlappingOrders.map(order => order.propertyId);

    // Obtener todas las propiedades que no están en los IDs reservados
    const availableProperties = await this.propertyModel.find({
      _id: { $nin: reservedPropertyIds },
    }).exec();

    // Devolver los IDs de las propiedades disponibles
    return availableProperties.map(property => toString(property._id));
  }

  private async findOrders(propertyId: string, isActive: boolean): Promise<Order[]> {
    return this.orderModel.find({ propertyId, isActive }).exec();
  }

}
