import {Body, Controller, HttpException, HttpStatus, Post, UseGuards, Get} from "@nestjs/common";
import { NotificationService } from "./notification.service";
import { HttpResponse } from "../shared/interfaces";
import {JwtAuthGuard} from "@src/auth/jwt-auth.guard";

@Controller("notification")
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService
  ) { }

  @UseGuards(JwtAuthGuard)
  @Get("message")
  async getNotificationForUser() {
    try{
      const {message} = await this.notificationService.getNotificationForUser();
      return {message};
    }catch(error){
      console.error("Error al crear alerta:", error);
      throw new HttpException("No se pudo crear la alerta correctamente", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post("alert")
  async createNotificationForUser(
      @Body() body: {message: string}
  ){
    try{
      await this.notificationService.createNotificationForUser(body.message);
      return {message: "Alerta creada exitosamente", httpStatus: HttpStatus.CREATED};
    }catch(error){
      console.error("Error al crear alerta:", error);
      throw new HttpException("No se pudo crear la alerta correctamente", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post()
  async create(
    @Body() body: { name: string, email: string, message: string, phone: string }
  ): Promise<HttpResponse<null>> {
    try {
      const html = this.notificationService.sendContactMail(body.name, body.email, body.message, body.phone);
      const myEmail: string = `${process.env.EMAIL_USERNAME}@gmail.com`;
      await this.notificationService.sendNotificationEmail(myEmail, "Contacto desde la web", html);
      return { message: 'Mensaje de contacto envíado', httpStatus: HttpStatus.CREATED };
    } catch (error) {
      console.error("Error al envíar el correo de contacto:", error);
      throw new HttpException("No se pudo envíar el correo de contacto", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}