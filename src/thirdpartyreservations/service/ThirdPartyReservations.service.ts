import { ConflictException, Injectable } from "@nestjs/common";
import { OrderService } from "../../order/service/order.service";
import { OrderDTO, UpdateOrderDTO } from "../../order/interface/order.interface";
import * as nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { PropertyService } from "../../property/service/property.service";
import { formatDate, toString } from "../../shared/functions";
import { ThirdPartyReservation } from "../model/ThirdPartyReservations.model";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

@Injectable()
export class ThirdPartyReservationsService {
  constructor(
    private readonly orderService: OrderService,
    private readonly propertyService: PropertyService,
    @InjectModel(ThirdPartyReservation.name) private readonly reservationModel: Model<ThirdPartyReservation> 
  ){ }

  async getThirdPartyPlatforms(): Promise<{_id: string, name: string, value: string}[]>{
    return this.reservationModel.find();
  }

  async createThirdPartyReservations(body: OrderDTO): Promise<void> {
    const userId: {_id: string, name: string, value: string} | null = await this.reservationModel.findOne({value: body.userId});
    if(!userId) throw new ConflictException(`Ocurrió un error al intentar cargar la orden externa. Intente nuevamente - ID ${body.userId}`);
    const newOrder: OrderDTO = {
      ...body,
      userId: userId._id
    }
    await this.orderService.createOrder(newOrder);
    const link = `${process.env.ORDER_PANEL_LINK}`;
    const property = await this.propertyService.getProperty(body.propertyId);

    const html = this.generateNotificationBodyHTML(property.name, link, toString(body.startDate), toString(body.endDate));
    await this.sendNotificationEmail(html);
  }

  async updateThirdPartyReservations(id: string, body: UpdateOrderDTO): Promise<OrderDTO> {
    return await this.orderService.updateOrder(id, body);
  }

  async deleteThirdPartyReservations(id: string): Promise<void> {
    return await this.orderService.deleteOrder(id);
  }


  private generateNotificationBodyHTML(property: string, link: string, startDate: string, endDate: string): string{
    return `
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          text-align: center;
          padding: 20px;
        }

        .container {
          max-width: 400px;
          margin: 0 auto;
          background-color: #fff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }

        p {
          margin-bottom: 15px;
          color: #333;
        }

        .btn {
          display: inline-block;
          padding: 10px 20px;
          background-color: #007bff;
          color: #fff;
          text-decoration: none;
          border-radius: 4px;
        }

        .btn:hover {
          background-color: #0056b3;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <p>Hola Admin!,</p>
        <p>
          Registramos una nueva reserva de la propiedad ${property}, desde la fecha <b>${formatDate(startDate,false ,"/")}</b>
          hasta la fecha <b>${formatDate(endDate,false ,"/")}</b>
        </p>
        <a class="btn" href="${link}" target="_blank" style="background-color: #007bff; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 4px;">Ir al panel</a>
      </div>
    </body>
  </html>
  `
  }

  private sendNotificationEmail(html: string): Promise<SMTPTransport.SentMessageInfo> {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: `${process.env.NOTIFIER_EMAIL}`,
        pass: process.env.APP_KEY,
      },
    });

    const mailOptions = {
      from: `${process.env.NOTIFIER_EMAIL}`,
      to: `${process.env.EMAIL_USERNAME}@gmail.com`,
      subject: 'Nueva reserva registrada',
      html,
    };

    return transporter.sendMail(mailOptions);
  }
}
