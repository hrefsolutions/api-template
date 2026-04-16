import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ThirdPartyReservationController } from '../thirdpartyreservations/controller/ThirdPartyReservations.controller';
import { ThirdPartyReservationsService } from '../thirdpartyreservations/service/ThirdPartyReservations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrderDTO, UpdateOrderDTO } from '../order/interface/order.interface';

describe('ThirdPartyReservationController', () => {
  let controller: ThirdPartyReservationController;
  let service: ThirdPartyReservationsService;

  const mockThirdPartyReservationsService = {
    getThirdPartyPlatforms: jest.fn(),
    createThirdPartyReservations: jest.fn(),
    updateThirdPartyReservations: jest.fn(),
    deleteThirdPartyReservations: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ThirdPartyReservationController],
      providers: [
        {
          provide: ThirdPartyReservationsService,
          useValue: mockThirdPartyReservationsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ThirdPartyReservationController>(ThirdPartyReservationController);
    service = module.get<ThirdPartyReservationsService>(ThirdPartyReservationsService);
  });

  test('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('getThirPartyPlatforms', () => {
    test('debe devolver todas las plataformas de terceros', async () => {
      const platforms = [{_id: "66a130f174dc3eceb1d1b383", name: "Booking", value: "booking"}];

      jest.spyOn(service, 'getThirdPartyPlatforms').mockResolvedValue(platforms);

      const result = await controller.getThirdPartyPlatforms();
      expect(result).toEqual(platforms);
    });

    test('debe lanzar HttpException si ocurre un error', async () => {
      jest.spyOn(service, 'getThirdPartyPlatforms').mockRejectedValue(new Error('Unknown error'));

      await expect(controller.getThirdPartyPlatforms()).rejects.toThrow(HttpException);
    });
  });

  describe('createThirdPartyReservations', () => {
    test('debe crear una nueva reserva de terceros', async () => {
      const order = {} as OrderDTO;

      jest.spyOn(service, 'createThirdPartyReservations').mockResolvedValue(undefined);

      const result = await controller.createThirdPartyReservations(order);
      expect(result).toEqual({
        message: 'Reserva creada correctamente',
        status: HttpStatus.CREATED,
      });
    });

    test('debe lanzar HttpException si ocurre un error', async () => {
      const order = {} as OrderDTO;

      jest.spyOn(service, 'createThirdPartyReservations').mockRejectedValue(new Error('Unknown error'));

      await expect(controller.createThirdPartyReservations(order)).rejects.toThrow(HttpException);
    });
  });

  describe('updateThirdPartyReservations', () => {
    test('debe actualizar una reserva de terceros existente', async () => {
      const updateOrder = {} as UpdateOrderDTO;
      const updatedReservation = {} as OrderDTO;
      const reservationId = 'validReservationId';

      jest.spyOn(service, 'updateThirdPartyReservations').mockResolvedValue(updatedReservation);

      const result = await controller.updateThirdPartyReservations(updateOrder, reservationId);
      expect(result).toEqual({
        data: updatedReservation,
        status: HttpStatus.OK,
      });
    });

    test('debe lanzar HttpException si ocurre un error al actualizar', async () => {
      const updateOrder = {} as UpdateOrderDTO;
      const reservationId = 'validReservationId';

      jest.spyOn(service, 'updateThirdPartyReservations').mockRejectedValue(new Error('Unknown error'));

      await expect(controller.updateThirdPartyReservations(updateOrder, reservationId)).rejects.toThrow(HttpException);
    });
  });

  describe('deleteThirdPartyReservations', () => {
    test('debe eliminar una reserva de terceros existente', async () => {
      const reservationId = 'validReservationId';

      jest.spyOn(service, 'deleteThirdPartyReservations').mockResolvedValue(undefined);

      const result = await controller.deleteThirdPartyReservations(reservationId);
      expect(result).toEqual({
        message: 'Reserva eliminada correctamente',
        status: HttpStatus.NO_CONTENT,
      });
    });

    test('debe lanzar HttpException si ocurre un error al eliminar', async () => {
      const reservationId = 'validReservationId';

      jest.spyOn(service, 'deleteThirdPartyReservations').mockRejectedValue(new Error('Unknown error'));

      await expect(controller.deleteThirdPartyReservations(reservationId)).rejects.toThrow(HttpException);
    });
  });
});
