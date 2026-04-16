import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { PropertyController } from '../property/controller/property.controller';
import { PropertyService } from '../property/service/property.service';
import { PropertyDTO, UpdatePropertyDTO } from '../property/interface/property.interface';

describe('PropertyController', () => {
  let controller: PropertyController;
  let service: PropertyService;

  const mockPropertyService = {
    findAllProperties: jest.fn(),
    getProperty: jest.fn(),
    getAvailability: jest.fn(),
    getAvailableProperties: jest.fn(),
    createProperty: jest.fn(),
    updateProperty: jest.fn(),
    deleteProperty: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PropertyController],
      providers: [
        {
          provide: PropertyService,
          useValue: mockPropertyService,
        },
      ],
    }).compile();

    controller = module.get<PropertyController>(PropertyController);
    service = module.get<PropertyService>(PropertyService);
  });

  test('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    test('debe devolver todas las propiedades', async () => {
      const properties = [{}, {}] as PropertyDTO[];

      jest.spyOn(service, 'findAllProperties').mockResolvedValue(properties);

      const result = await controller.findAll();
      expect(result).toEqual(properties);
    });

    test('debe lanzar HttpException si ocurre un error', async () => {
      jest.spyOn(service, 'findAllProperties').mockRejectedValue(new Error('Unknown error'));

      await expect(controller.findAll()).rejects.toThrow(HttpException);
    });
  });

  describe('findOne', () => {
    test('debe devolver una propiedad si el id es válido', async () => {
      const property = {} as PropertyDTO;
      const propertyId = 'validPropertyId';

      jest.spyOn(service, 'getProperty').mockResolvedValue(property);

      const result = await controller.findOne(propertyId);
      expect(result).toEqual({ data: property, httpStatus: HttpStatus.OK });
    });

    test('debe lanzar HttpException si la propiedad no es encontrada', async () => {
      const propertyId = 'invalidPropertyId';

      jest.spyOn(service, 'getProperty').mockRejectedValue(new Error('Property not found'));

      await expect(controller.findOne(propertyId)).rejects.toThrow(HttpException);
    });
  });

  describe('getAvailability', () => {
    test('debe devolver la disponibilidad de una propiedad', async () => {
      const response = { message: 'Property is available', status: 200 };
      const propertyId = 'validPropertyId';
      const startDate = '2023-08-01';
      const endDate = '2023-08-10';

      jest.spyOn(service, 'getAvailability').mockResolvedValue(response);

      const result = await controller.getAvailability(propertyId, startDate, endDate);
      expect(result).toEqual(response);
    });

    test('debe lanzar HttpException si ocurre un error', async () => {
      const propertyId = 'validPropertyId';
      const startDate = '2023-08-01';
      const endDate = '2023-08-10';

      jest.spyOn(service, 'getAvailability').mockRejectedValue(new Error('Unknown error'));

      await expect(controller.getAvailability(propertyId, startDate, endDate)).rejects.toThrow(Error);
    });
  });

  describe('getAvailableProperties', () => {
    test('debe devolver las propiedades disponibles', async () => {
      const properties = ['property1', 'property2'];
      const startDate = '2023-08-01';
      const endDate = '2023-08-10';

      jest.spyOn(service, 'getAvailableProperties').mockResolvedValue(properties);

      const result = await controller.getAvailableProperties(startDate, endDate);
      expect(result).toEqual(properties);
    });

    test('debe lanzar HttpException si las fechas son inválidas', async () => {
      const startDate = 'invalid-date';
      const endDate = 'invalid-date';

      await expect(controller.getAvailableProperties(startDate, endDate)).rejects.toThrow(HttpException);
    });
  });

  describe('create', () => {
    test('debe crear una nueva propiedad', async () => {
      const property = {} as PropertyDTO;

      jest.spyOn(service, 'createProperty').mockResolvedValue(undefined);

      const result = await controller.create(property);
      expect(result).toEqual({ message: 'Property created successfully', httpStatus: HttpStatus.CREATED });
    });

    test('debe lanzar HttpException si ocurre un error', async () => {
      const property = {} as PropertyDTO;

      jest.spyOn(service, 'createProperty').mockRejectedValue(new Error('Unknown error'));

      await expect(controller.create(property)).rejects.toThrow(HttpException);
    });
  });

  describe('update', () => {
    test('debe actualizar una propiedad existente', async () => {
      const propertyId = 'validPropertyId';
      const updatePropertyDto = {} as UpdatePropertyDTO;
      const updatedProperty = {} as PropertyDTO;

      jest.spyOn(service, 'updateProperty').mockResolvedValue(updatedProperty);

      const result = await controller.update(propertyId, updatePropertyDto);
      expect(result).toEqual({ data: updatedProperty, httpStatus: HttpStatus.OK });
    });

    test('debe lanzar HttpException si la propiedad no es encontrada', async () => {
      const propertyId = 'invalidPropertyId';
      const updatePropertyDto = {} as UpdatePropertyDTO;

      jest.spyOn(service, 'updateProperty').mockRejectedValue(new Error('Property not found'));

      await expect(controller.update(propertyId, updatePropertyDto)).rejects.toThrow(HttpException);
    });
  });

  describe('remove', () => {
    test('debe eliminar una propiedad existente', async () => {
      const propertyId = 'validPropertyId';

      jest.spyOn(service, 'deleteProperty').mockResolvedValue(undefined);

      const result = await controller.remove(propertyId);
      expect(result).toEqual({ message: 'Property deleted successfully', httpStatus: HttpStatus.NO_CONTENT });
    });

    test('debe lanzar HttpException si la propiedad no es encontrada', async () => {
      const propertyId = 'invalidPropertyId';

      jest.spyOn(service, 'deleteProperty').mockRejectedValue(new Error('Property not found'));

      await expect(controller.remove(propertyId)).rejects.toThrow(HttpException);
    });
  });
});
