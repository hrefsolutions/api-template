import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus, ConflictException } from '@nestjs/common';
import { MercadoPagoController } from '../mercadopago/controller/mercadopago.controller';
import { MercadoPagoService } from '../mercadopago/service/mercadopago.service';

describe('MercadoPagoController', () => {
  let controller: MercadoPagoController;
  let service: MercadoPagoService;

  const mockMercadoPagoService = {
    checkStatusPayment: jest.fn(),
    generatePaymentLink: jest.fn(),
    generateOrders: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MercadoPagoController],
      providers: [
        {
          provide: MercadoPagoService,
          useValue: mockMercadoPagoService,
        },
      ],
    }).compile();

    controller = module.get<MercadoPagoController>(MercadoPagoController);
    service = module.get<MercadoPagoService>(MercadoPagoService);
  });

  test('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('checkPaymentStatus', () => {
    test('debe devolver el estado del pago si el paymentId es válido', async () => {
      const paymentIdStr = '12345';
      const paymentId = 12345;
      const paymentStatus = { status: 'approved', paymentId, status_detail: 'approved' };

      jest.spyOn(service, 'checkStatusPayment').mockResolvedValue(paymentStatus);

      const result = await controller.checkPaymentStatus(paymentIdStr);
      expect(result).toEqual({
        status: HttpStatus.OK,
        message: 'Reserva aprobada',
        data: paymentStatus,
      });
    });

    test('debe lanzar HttpException si el paymentId es inválido', async () => {
      const paymentId = 'null';
      await expect(controller.checkPaymentStatus(paymentId)).rejects.toThrow(HttpException);
    });

    test('debe lanzar ConflictException si el servicio lanza ConflictException', async () => {
      const paymentId = 'conflictPaymentId';

      jest.spyOn(service, 'checkStatusPayment').mockRejectedValue(new ConflictException());

      await expect(controller.checkPaymentStatus(paymentId)).rejects.toThrow(ConflictException);
    });

    test('debe lanzar HttpException si el servicio lanza un error desconocido', async () => {
      const paymentId = 'errorPaymentId';

      jest.spyOn(service, 'checkStatusPayment').mockRejectedValue(new Error('Unknown error'));

      await expect(controller.checkPaymentStatus(paymentId)).rejects.toThrow(HttpException);
    });
  });

  describe('generatePaymentLink', () => {
    test('debe devolver el link de pago si paymentData es válido', async () => {
      const paymentData = { /* ... */ } as any;
      const paymentLink = 'http://payment.link';

      jest.spyOn(service, 'generatePaymentLink').mockResolvedValue(paymentLink);

      const result = await controller.generatePaymentLink(paymentData);
      expect(result).toEqual({
        status: HttpStatus.CREATED,
        message: 'Link de pago generado correctamente',
        link: paymentLink,
      });
    });

    test('debe lanzar ConflictException si el servicio lanza ConflictException', async () => {
      const paymentData = { /* ... */ } as any;

      jest.spyOn(service, 'generatePaymentLink').mockRejectedValue(new ConflictException());

      await expect(controller.generatePaymentLink(paymentData)).rejects.toThrow(ConflictException);
    });

    test('debe lanzar HttpException si el servicio lanza un error desconocido', async () => {
      const paymentData = { /* ... */ } as any;

      jest.spyOn(service, 'generatePaymentLink').mockRejectedValue(new Error('Unknown error'));

      await expect(controller.generatePaymentLink(paymentData)).rejects.toThrow(HttpException);
    });
  });

  describe('createOrderForUser', () => {
    test('debe devolver la orden si userId y createOrderDto son válidos', async () => {
      const userId = 'validUserId';
      const body = { createOrderDto: { /* ... */ }, paymentStatus: true } as any;
      const order = { /* ... */ } as any;

      jest.spyOn(service, 'generateOrders').mockResolvedValue(order);

      const result = await controller.createOrderForUser(userId, body);
      expect(result).toEqual({
        status: HttpStatus.CREATED,
        message: 'Orden creada correctamente',
        data: order,
      });
    });

    test('debe lanzar ConflictException si el servicio lanza ConflictException', async () => {
      const userId = 'conflictUserId';
      const body = { createOrderDto: { /* ... */ }, paymentStatus: true } as any;

      jest.spyOn(service, 'generateOrders').mockRejectedValue(new ConflictException());

      await expect(controller.createOrderForUser(userId, body)).rejects.toThrow(ConflictException);
    });

    test('debe lanzar HttpException si el servicio lanza un error desconocido', async () => {
      const userId = 'errorUserId';
      const body = { createOrderDto: { /* ... */ }, paymentStatus: true } as any;

      jest.spyOn(service, 'generateOrders').mockRejectedValue(new Error('Unknown error'));

      await expect(controller.createOrderForUser(userId, body)).rejects.toThrow(HttpException);
    });
  });
});
