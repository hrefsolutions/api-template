import { Test, TestingModule } from '@nestjs/testing';
import { UserAdminService } from '../useradmin/service/useradmin.service';
import { UserAdminDTO } from '../useradmin/interface/useradmin.interface';
import { BadRequestException, ConflictException, HttpException, HttpStatus } from '@nestjs/common';
import { AuthController } from '../auth/auth/auth.controller';
import { AuthService } from '../auth/auth/auth.service';
import { UserAdmin } from '../useradmin/model/useradmin.model';
import { Request } from 'express';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;
  let userAdminService: UserAdminService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            validateUser: jest.fn(),
            login: jest.fn(),
          },
        },
        {
          provide: UserAdminService,
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    authController = moduleRef.get<AuthController>(AuthController);
    authService = moduleRef.get<AuthService>(AuthService);
    userAdminService = moduleRef.get<UserAdminService>(UserAdminService);
  });

  test('El componente se debe montar', () => {
    expect(authController).toBeDefined();
  });

  describe('verifyToken', () => {
    test('Debe responder que el token es valido', async () => {
      const mockRequest = {
        user: { id: '123', email: 'test@ejemplo.com' },
      } as unknown as Request;

      const result = await authController.verifyToken(mockRequest);

      expect(result).toEqual({
        message: 'Token aún válido.',
        user: mockRequest.user,
      });
    });
  });

  describe('login', () => {
    test('debe devolver un token si se proporcionan credenciales válidas', async () => {
      const loginDto: UserAdminDTO = { email: 'test@ejemplo.com', password: 'password123', name: '' };
      const user = {
        _id: '123',
        email: 'test@ejemplo.com',
        password: 'password123',
        name: '',
      } as unknown as UserAdmin;
      const result = { access_token: 'token' };

      jest.spyOn(authService, 'validateUser').mockResolvedValue(user);
      jest.spyOn(authService, 'login').mockResolvedValue(result);

      expect(await authController.login(loginDto)).toBe(result);
    });

    test('debe lanzar una UnauthorizedException si se proporcionan credenciales no válidas', async () => {
      const loginDto: UserAdminDTO = { email: 'test@ejemplo.com', password: 'contraseñaErronea', name: '' };

      jest.spyOn(authService, 'validateUser').mockResolvedValue(null);

      await expect(authController.login(loginDto)).rejects.toThrow(HttpException);
    });
  });

  describe('register', () => {
    test('debe crear un nuevo usuario si se proporcionan datos válidos', async () => {
      const registerDto: UserAdminDTO = { email: 'test@ejemplo.com', password: 'password123', name: 'Test User' };
      const createdUser = { ...registerDto, _id: '123' };

      jest.spyOn(userAdminService, 'create').mockResolvedValue(createdUser);

      const result = await authController.register(registerDto);

      expect(result).toEqual({
        status: HttpStatus.CREATED,
        message: 'Usuario creado correctamente',
      });
    });

    test('debe lanzar una excepción BadRequestException si faltan campos obligatorios', async () => {
      const registerDto: UserAdminDTO = { email: '', password: '', name: '' };

      await expect(authController.register(registerDto)).rejects.toThrow(BadRequestException);
    });

    test('debe lanzar una ConflictException si el usuario ya existe', async () => {
      const registerDto: UserAdminDTO = { email: 'test@ejemplo.com', password: 'password123', name: 'Test User' };

      jest.spyOn(userAdminService, 'create').mockImplementation(() => {
        throw new ConflictException();
      });

      await expect(authController.register(registerDto)).rejects.toThrow(ConflictException);
    });

    test('debe lanzar HttpException para cualquier otro error', async () => {
      const registerDto: UserAdminDTO = { email: 'test@ejemplo.com', password: 'password123', name: 'Test User' };

      jest.spyOn(userAdminService, 'create').mockImplementation(() => {
        throw new HttpException('Internal error', HttpStatus.INTERNAL_SERVER_ERROR);
      });

      await expect(authController.register(registerDto)).rejects.toThrow(HttpException);
    });
  });

});
