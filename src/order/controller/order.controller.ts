import { Controller, Get, Post, Put, Delete, Param, Body, HttpStatus, HttpException, UseGuards, Query } from '@nestjs/common';
import { OrderService } from '../service/order.service';
import { OrderDTO, StatesEnum, UpdateOrderDTO } from '../interface/order.interface';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { UsuariosService } from '../../user/service/user.service';
import { HttpResponse } from '../../shared/interfaces';
import { NotificationService } from '../../notification/notification.service';
import {PropertyService} from "../../property/service/property.service";
import {toArray, toString} from "funciones-basicas";

@Controller('orders')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly userService: UsuariosService,
    private readonly notificationService: NotificationService,
    private readonly propertyService: PropertyService
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll() {
    try {
      const orders = await this.orderService.findAllOrders();
      return { data: orders, httpStatus: HttpStatus.OK };
    } catch (error: any ) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const order = await this.orderService.getOrder(id);
      return { data: order, httpStatus: HttpStatus.OK };
    } catch (error: any ) {
      throw new HttpException(error.message, error.status || HttpStatus.NOT_FOUND);
    }
  }

  @Post()
  async create(@Body() order: OrderDTO) {
    try {
      await this.orderService.createOrder(order);
      return { message: 'Orden creada exitosamente', httpStatus: HttpStatus.CREATED };
    } catch (error: any ) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id')
  async update(
      @Param('orderid') orderid: string,
      @Body() order: UpdateOrderDTO)
    {
    try {
      const updatedOrder = await this.orderService.updateOrder(orderid, order);
      return { data: updatedOrder, httpStatus: HttpStatus.OK };
    } catch (error: any ) {
      throw new HttpException(error.message, error.status || HttpStatus.NOT_FOUND);
    }
  }

  @Put('confirm/:orderid/:userid')
  async confirmOrder(
    @Param('orderid') id: string,
    @Param('userid') userId: string,
    @Body() body: {
      paymentId: string;
      paymentStatus: boolean;
    }
  ): Promise<HttpResponse<null>> {
    try {
      const order: OrderDTO = await this.orderService.getOrder(id);
      const user = await this.userService.getUser(userId);

      order.payment.paymentStatus = body.paymentStatus;
      order.payment.paymentId = body.paymentId;

      const {price, currency} = await this.propertyService.getProperty(order.propertyId);

      let formattedPrice: string = ""
      let priceInPesos: number = 0.00

      if(currency !== "ARS") {
        const dollarRate = await this.orderService.getDollarRate();
        priceInPesos = price * dollarRate;
      } else {
        priceInPesos = price
      }

      formattedPrice = `${priceInPesos.toLocaleString('es-AR')}`;

      await this.orderService.updateOrder(id, order);
      const htmlContent = this.notificationService.generatePaymentConfirmation(user.fullName, formattedPrice);
      await this.notificationService.sendNotificationEmail(user.email, `Confirmación de pago de la orden #${toString(order._id)}`, htmlContent);

      return { message: 'Orden confirmada y correo enviado.', httpStatus: HttpStatus.OK };
    } catch (error: any) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put('orderstate/:orderid')
  async updateOrderStatus(
    @Param('orderid') id: string,
    @Body() body: {
      state: StatesEnum;
    }
  ){
    try {
      const order: OrderDTO = await this.orderService.getOrder(id);
      order.state = body.state;
      
      const user = await this.userService.getUser(order.userId);
      const userorder = toArray(user.orders).find(uorder => uorder._id === id);
      if(!userorder) throw new HttpException("Oucrrió un error al intentar modificar el estado de la orden, por favor intente mas tarde.", HttpStatus.NOT_FOUND);
      
      userorder.state = order.state;
      await this.orderService.updateOrder(id, order);
      await this.userService.updateUser(order.userId, user);

      return { message: 'Orden actualizada satisfactoriamente', httpStatus: HttpStatus.OK };
    } catch (error: any) {
      throw new HttpException(error.message, error.status || HttpStatus.NOT_FOUND);
    }
  }


  @Put("finish-order/:id")
  async disableOrder(
    @Param('id') id: string,
    @Query("userid") userid: string
  ) {
    if(!userid) return { message: 'Id de usuario es requerido', httpStatus: HttpStatus.BAD_REQUEST };
    try {
      await this.orderService.disableOrder(id, userid);
      return { message: 'Orden finalizada con éxito', httpStatus: HttpStatus.NO_CONTENT };
    } catch (error: any ) {
      throw new HttpException(error.message, error.status || HttpStatus.NOT_FOUND);
    }
  }


  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      await this.orderService.deleteOrder(id);
      return { message: 'Orden eliminada exitosamente', httpStatus: HttpStatus.NO_CONTENT };
    } catch (error: any ) {
      throw new HttpException(error.message, error.status || HttpStatus.NOT_FOUND);
    }
  }
}
