import { ConflictException, Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User } from "../../user/model/user.model";
import { Order } from "../../order/model/order.model";
import MercadoPagoConfig, { Payment, Preference } from "mercadopago";
import { CreateOrderDTO, OrderDTO } from "../../order/interface/order.interface";
import { Items } from "mercadopago/dist/clients/commonTypes";
import { PaymentData } from "../interface/mercadopago.interface";
import { NotificationService } from "../../notification/notification.service";
import {PropertyService} from "../../property/service/property.service";
import {PropertyDTO} from "../../property/interface/property.interface";
import {formatDate, parseNumber, toString} from "funciones-basicas";
import {
  MINIMUM_STAY_DAYS,
  calculateStayLengthInDays,
  normalizeDateToEndOfDay,
  normalizeDateToStartOfDay,
  rangesOverlap
} from "../../shared/functions";

@Injectable()
export class MercadoPagoService {
  private readonly logger = new Logger(MercadoPagoService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Order.name) private readonly orderModel: Model<Order>,
    private readonly notificationService: NotificationService,
    private readonly propertyService: PropertyService
  ) { }

  async generatePaymentLink(paymentData: PaymentData){
    const authMercadoPago = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });
    const items: Items[] = [
      {
        id: paymentData.property._id!,
        title: toString(paymentData.property.name),
        unit_price: parseNumber(paymentData.property.price),
        quantity: 1,
        currency_id: paymentData.property.currency ?? "ARS",
        picture_url: paymentData.property.coverImg
      }
    ]
    const preference = await new Preference(authMercadoPago).create({
      body: {
        items: items,
        back_urls: {
          success: paymentData.successUrl,
          failure: paymentData.failureUrl,
        },
        redirect_urls:{
          success: paymentData.successUrl,
          failure: paymentData.failureUrl,
        },
        auto_return: paymentData.autoReturn ?? "all",
      }
    });

    return preference.init_point;
  }

  async generateOrders(userid: string, order: CreateOrderDTO, paymentStatus: boolean, bankTransfer?: boolean){
    const user = await this.userModel.findById(userid);
    if(!user) throw new ConflictException(`Usuario ${userid} no encontrado`);

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

    // Inicio de creacion de Order Admin
    const orderData: OrderDTO = {
      ...order,
      propertyId: order.propertyId,
      userId: userid,
      payment: {
        paymentId: order.payment.paymentId,
        paymentStatus: paymentStatus,
      },
      isActive: order.isActive ?? true,
    }
    const ordenDB = new this.orderModel(orderData);
    const newOrder = await ordenDB.save();
    // Fin de creacion de Order Admin

    // Inicio de creacion de UserOrder
    orderData._id = toString(newOrder._id);
    user.orders.push(orderData)
    await this.userModel.updateOne(
      { _id: userid },
      { $push: { orders: orderData } }
    );
    // Fin de creacion de UserOrder

    const link = process.env.NOTIFICATION_LINK!;
    const propertyName: PropertyDTO = await this.propertyService.getProperty(orderData.propertyId);
    const fechaDesde = formatDate(toString(orderData.startDate), false, "/");
    const fechaHasta = formatDate(toString(orderData.endDate), false, "/");
    try {
      if (!propertyName) {
        throw new ConflictException("No se puede acceder a la información sobre la propiedad a reservar");
      }

      const userHtml = this.notificationService.generateBankTransferNotificationUser(
        user.fullName,
        link,
        propertyName.name,
        fechaDesde,
        fechaHasta
      );

      await this.notificationService.sendNotificationEmail(
        user.email,
        'Gracias por reservar en Template Hospedajes',
        userHtml
      );
    } catch (err) {
      this.logger.error(`No se pudo enviar email al usuario: ${err instanceof Error ? err.message : err}`);
    }

    if (bankTransfer) {
      try {
        const adminEmail = `${process.env.EMAIL_USERNAME!}`;
        const adminHtml = this.notificationService.generateBankTransferNotificationAdmin(
          user.fullName,
          user.email,
          propertyName.name,
          fechaDesde,
          fechaHasta
        );

        await this.notificationService.sendNotificationEmail(
          adminEmail,
          'Nueva orden por transferencia bancaria',
          adminHtml
        );
      } catch (err) {
        this.logger.error(`No se pudo enviar email al admin: ${err instanceof Error ? err.message : err}`);
      }
    }

    return newOrder;
  }

  private async ensurePropertyAvailability(propertyId: string, startDate: Date, endDate: Date): Promise<void> {
    const desiredStart = normalizeDateToStartOfDay(startDate);
    const desiredEnd = normalizeDateToEndOfDay(endDate);

    const activeOrders = await this.orderModel.find({
      propertyId,
      isActive: true,
    });

    for (const activeOrder of activeOrders) {
      const activeStart = normalizeDateToStartOfDay(activeOrder.startDate);
      const activeEnd = normalizeDateToEndOfDay(activeOrder.endDate);

      if (rangesOverlap(desiredStart, desiredEnd, activeStart, activeEnd)) {
        throw new ConflictException('No hay disponibilidad para las fechas seleccionadas.');
      }
    }
  }

    /**
   * 
   * @method checkStatusPayment
   * @description Busca y valida el estado aprobado de un pago. Si el pago no fue aprobado, retorna un HTTP Status 400
   */
    async checkStatusPayment(paymentId: string){
      const mercadopago = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });
      const payment = await new Payment(mercadopago).get({ id: paymentId });
  
      if(payment.status !== "approved") throw new ConflictException("El pago no ha sido aprobado");
  
      return {
        status: payment.status,
        paymentId: payment.id,
        status_detail: payment.status_detail,
      };
    }
  }