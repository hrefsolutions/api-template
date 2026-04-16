import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import {InjectModel} from "@nestjs/mongoose";
import { NotificationForUser } from "./model/notification.model";

import { Model } from "mongoose";
import {Cron, CronExpression} from "@nestjs/schedule";
import { normalizeEmail } from '../shared/utils';

@Injectable()
export class NotificationService {
  private readonly transporter: nodemailer.Transporter;
  private readonly logger = new Logger(NotificationService.name);


  constructor(
      @InjectModel(NotificationForUser.name) private readonly notificationModel: Model<NotificationForUser>
  ) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: `${process.env.NOTIFIER_EMAIL}`,
        pass: process.env.APP_KEY,
      },
    });
  }

  /**
 * Genera el contenido HTML de una notificación de transferencia bancaria para el usuario.
 * @param name - El nombre del usuario.
 * @param link - El enlace al panel del usuario.
 * @param propertyName - El nombre de la propiedad reservada.
 * @param fechaDesde - Fecha DESDE que fue reservada la propiedad
 * @param fechaHasta - Fecha HASTA que fue reservada la propiedad
 * @returns El contenido HTML personalizado de la notificación para el usuario.
 */
  generateBankTransferNotificationUser(name: string, link: string, propertyName: string, fechaDesde: string, fechaHasta: string ): string {
    const template = this.loadTemplate('transfer-user-template.html');
    return this.generateTemplate(template, { name, link, propertyName, fechaDesde, fechaHasta });
  }

  /**
   * Genera el contenido HTML de una notificación de transferencia bancaria para el administrador.
   * @param username - El nombre de usuario.
   * @param userEmail - El correo electrónico del usuario.
   * @param propertyName - el nombre de la propiedad que reserva el usuario
   * @param startDate - fecha de inicio de reserva
   * @param endDate - fecha de finalización de reserva
   * @returns El contenido HTML personalizado de la notificación para el administrador.
   */
  generateBankTransferNotificationAdmin(username: string, userEmail: string, propertyName: string ,startDate: string, endDate: string): string {
    const template = this.loadTemplate('transfer-admin-template.html');
    return this.generateTemplate(template, { username, userEmail, propertyName, startDate, endDate });
  }

  /**
   * Genera el contenido HTML de una notificación de transferencia bancaria para el administrador.
   * @param username - El nombre de usuario.
   * @param property_price
   * @returns El contenido HTML personalizado de la notificación para el administrador.
   */
  generatePaymentConfirmation(username: string, property_price: string): string {
    const template = this.loadTemplate('order-confirmation-template.html');
    return this.generateTemplate(template, { username, property_price });
  }

  /**
   * Genera el envío de formulario de contacto
   * @param name - nombre del contacto
   * @param email - email del contacto
   * @param message - mensaje enviado por el usuario que solicita el contacto
   * @param phone - numero de telefono del usuario que solicita el contacto
   * @returns El contenido HTML personalizado para la notificacion de contacto
   */
  sendContactMail(name: string, email: string, message: string, phone: string): string {
    const template = this.loadTemplate('contact-template.html');
    return this.generateTemplate(template, { name, email, message, phone });
  }

  /**
   * Carga una plantilla HTML desde un archivo.
   * @param templatePath - El nombre del archivo de la plantilla que se encuentra en la carpeta 'templates'.
   * @returns El contenido de la plantilla HTML como una cadena de texto.
  */
  private loadTemplate(templatePath: string): string {
    const filePath = path.join(process.cwd(), 'src/notification/templates', templatePath);
    return fs.readFileSync(filePath, 'utf-8');
  }

    /**
   * Reemplaza las variables en la plantilla HTML con los valores proporcionados.
   * @param template - La plantilla HTML en la que se realizarán los reemplazos.
   * @param variables - Un objeto que contiene pares clave-valor donde la clave es el nombre de la variable en la plantilla y el valor es el valor a insertar.
   * @returns La plantilla HTML con las variables reemplazadas por sus valores correspondientes.
   */
  private generateTemplate(template: string, variables: Record<string, string>): string {
    let html = template;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      html = html.replace(regex, value);
    }
    return html;
  }

  /**
   * Envía un correo electrónico con el contenido HTML proporcionado.
   * @param {string} email - La dirección de correo electrónico del destinatario.
   * @param {string} subject - El asunto del correo electrónico.
   * @param {string} html - El contenido HTML del correo electrónico.
   * @param {number} [retries=3] - Número máximo de intentos en caso de error (por defecto, 3).
   * @returns {Promise<SMTPTransport.SentMessageInfo | null>} Un objeto con la información del envío o `null` si todos los intentos fallan.
  */
  async sendNotificationEmail(
    email: string, 
    subject: string, 
    html: string, 
    retries: number = 3
  ): Promise<SMTPTransport.SentMessageInfo | null> {
    let attempt = 0;
    const realToEmail = normalizeEmail(email);

    while (attempt < retries) {
      const mailOptions = {
        from: `${process.env.NOTIFIER_EMAIL}`,
        to: realToEmail,
        subject,
        html,
      };

      if (!mailOptions.to) {
        this.logger.error(`Intento ${attempt + 1}: destinatario vacío`);
        return null;
      }

      try {
        const info = await this.transporter.sendMail(mailOptions);

        const now = new Date().toISOString();
        this.logger.debug(
          `Correo enviado exitosamente en el intento ${attempt + 1} →`,
          {
            from: mailOptions.from,
            to: mailOptions.to,
            date: now,
            messageId: info.messageId,
          },
        );

        return info;
      } catch (error) {
        attempt++;
        this.logger.debug(
          `Error al enviar correo. Intento ${attempt} de ${retries}:`,
          error,
        );

        if (attempt >= retries) {
          this.logger.error(
            'Límite de reintentos alcanzado. No se pudo enviar el correo.',
          );
          return null;
        }

        await this.sleep(1000 * attempt);
      }
    }

    return null;
  }
  /**
   * Función auxiliar para pausar la ejecución (espera entre reintentos).
   * @param ms - Milisegundos de espera.
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async createNotificationForUser(message: string): Promise<void>{
    await this.notificationModel.create({message})
  }

  async getNotificationForUser(): Promise<NotificationForUser> {
    const notification: NotificationForUser | null = await this.notificationModel
        .findOne()
        .sort({ createdAt: -1 });

    if (!notification) {
      return { message: "Alerta no generada" };
    }

    return notification;
  }

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async cleanOldNotifications(){
    const latestNotification = await this.notificationModel.findOne().sort({ createdAt: -1 });

    if (latestNotification) {
      await this.notificationModel.deleteMany({
        _id: { $ne: latestNotification._id }
      });
      this.logger.log('Se eliminaron todas las notificaciones excepto la última');
    }
  }

}
