import { Body, ConflictException, Controller, Get, HttpException, HttpStatus, Param, Post, Query } from "@nestjs/common";
import { MercadoPagoService } from "../service/mercadopago.service";
import { CreateOrderDTO } from "../../order/interface/order.interface";
import { PaymentData } from "../interface/mercadopago.interface";

@Controller("payments")
export class MercadoPagoController {
  constructor(
    private readonly mercadoPagoService: MercadoPagoService
  ) { }

  @Get("check-payment/status/:paymentId")
  async checkPaymentStatus(
    @Param("paymentId") paymentId: string,
  ) {
    if (paymentId === "null" || paymentId === "") {
      throw new HttpException("El ID de pago es un campo obligatorio", HttpStatus.BAD_REQUEST)
    }
    return this.mercadoPagoService.checkStatusPayment(paymentId)
      .then((paymentStatus) => ({
        status: HttpStatus.OK,
        message: 'Reserva aprobada',
        data: paymentStatus
      }))
      .catch((error) => {
        if (error instanceof ConflictException) {
          throw error;
        }
        throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
      });
  }

  @Post('link')
  async generatePaymentLink(@Body() paymentData: PaymentData) {
    return this.mercadoPagoService.generatePaymentLink(paymentData)
      .then((paymentLink) => ({
        status: HttpStatus.CREATED,
        message: 'Link de pago generado correctamente',
        link: paymentLink
      }))
      .catch((error) => {
        if (error instanceof ConflictException) {
          throw error;
        }
        throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
      });
  }

  @Post('/payment-order/create/:userId')
  async createOrderForUser(
    @Param("userId") userId: string,
    @Body() body: {createOrderDto: CreateOrderDTO, paymentStatus: boolean},
    @Query('bankTransfer') bankTransfer?: boolean
  ) {
    return this.mercadoPagoService.generateOrders(userId, body.createOrderDto, body.paymentStatus, bankTransfer)
      .then((order) => ({
        status: HttpStatus.CREATED,
        message: 'Orden creada correctamente',
        data: order
      }))
      .catch((error) => {
        if (error instanceof ConflictException) {
          throw error;
        }
        throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
      });
  }

}