import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus, ConflictException } from '@nestjs/common';
import { UsuariosController } from '../user/controller/user.controller';
import { UsuariosService } from '../user/service/user.service';
import { UpdateUserDTO, UserDTO } from '../user/interface/user.interface';
import { User } from '../user/model/user.model';

describe('UsuariosController', () => {
  let controller: UsuariosController;
  let service: UsuariosService;

  const mockUsuariosService = {
    getAllUsers: jest.fn(),
    create: jest.fn(),
    getUserByEmail: jest.fn(),
    updateUser: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsuariosController],
      providers: [
        {
          provide: UsuariosService,
          useValue: mockUsuariosService,
        },
      ],
    }).compile();

    controller = module.get<UsuariosController>(UsuariosController);
    service = module.get<UsuariosService>(UsuariosService);
  });

  test('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('getUsers', () => {
    test('debe devolver todos los usuarios', async () => {
      const users = [{} as UserDTO, {} as UserDTO];

      jest.spyOn(service, 'getAllUsers').mockResolvedValue(users);

      const result = await controller.getUsers();
      expect(result).toEqual(users);
    });

    test('debe lanzar HttpException si ocurre un error', async () => {
      jest.spyOn(service, 'getAllUsers').mockRejectedValue(new Error('Unknown error'));

      await expect(controller.getUsers()).rejects.toThrow(Error);
    });
  });

  describe('createUser', () => {
    test('debe crear un nuevo usuario', async () => {
      const user = {} as UserDTO;
      const createdUser = { ...user, id: 'newUserId' } as UserDTO;

      jest.spyOn(service, 'create').mockResolvedValue(createdUser as unknown as User);

      const result = await controller.createUser(user);
      expect(result).toEqual({
        status: HttpStatus.CREATED,
        message: 'Usuario creado correctamente',
        data: createdUser,
      });
    });

    test('debe lanzar ConflictException si el usuario ya existe', async () => {
      const user = {} as UserDTO;

      jest.spyOn(service, 'create').mockRejectedValue(new ConflictException());

      await expect(controller.createUser(user)).rejects.toThrow(ConflictException);
    });

    test('debe lanzar HttpException si ocurre un error inesperado', async () => {
      const user = {} as UserDTO;

      jest.spyOn(service, 'create').mockRejectedValue(new Error('Unknown error'));

      await expect(controller.createUser(user)).rejects.toThrow(HttpException);
    });
  });

  describe('getUserByEmail', () => {
    test('debe devolver un usuario por email', async () => {
      const email = 'test@example.com';
      const user: UserDTO = {
        _id: 'some-id',
        email,
        enabled: true,
        name: 'Test user',
        last_name: 'Test',
        fullName: 'Test user Test',
        dni: 0,
        phone: 0
      };
      jest.spyOn(service, 'getUserByEmail').mockResolvedValue({user: user, message: "Usuario encontrado"});

      const result = await controller.getUserByEmail({ email });
      expect(result).toEqual({ user, message: "Usuario encontrado" });
    });

    test('debe lanzar HttpException si ocurre un error', async () => {
      const email = 'test@example.com';

      jest.spyOn(service, 'getUserByEmail').mockRejectedValue(new Error('Unknown error'));

      await expect(controller.getUserByEmail({ email })).rejects.toThrow(Error);
    });
  });

  describe('updateUser', () => {
    test('debe actualizar un usuario existente', async () => {
      const userId = 'validUserId';
      const updateUserDto = {} as UpdateUserDTO;

      jest.spyOn(service, 'updateUser').mockResolvedValue(undefined);

      const result = await controller.updateUser(userId, updateUserDto);
      expect(result).toEqual({
        status: HttpStatus.OK,
        message: 'Usuario actualizado correctamente',
      });
    });

    test('debe lanzar ConflictException si ocurre un conflicto al actualizar', async () => {
      const userId = 'invalidUserId';
      const updateUserDto = {} as UpdateUserDTO;

      jest.spyOn(service, 'updateUser').mockRejectedValue(new ConflictException());

      await expect(controller.updateUser(userId, updateUserDto)).rejects.toThrow(ConflictException);
    });

    test('debe lanzar HttpException si ocurre un error inesperado', async () => {
      const userId = 'anyUserId';
      const updateUserDto = {} as UpdateUserDTO;

      jest.spyOn(service, 'updateUser').mockRejectedValue(new Error('Unknown error'));

      await expect(controller.updateUser(userId, updateUserDto)).rejects.toThrow(HttpException);
    });
  });

  describe('deleteUser', () => {
    test('debe eliminar un usuario existente', async () => {
      const userId = 'validUserId';

      jest.spyOn(service, 'remove').mockResolvedValue(undefined);

      const result = await controller.deleteUser(userId);
      expect(result).toEqual({
        status: HttpStatus.OK,
        message: 'Usuario eliminado correctamente',
      });
    });

    test('debe lanzar ConflictException si ocurre un conflicto al eliminar', async () => {
      const userId = 'invalidUserId';

      jest.spyOn(service, 'remove').mockRejectedValue(new ConflictException());

      await expect(controller.deleteUser(userId)).rejects.toThrow(ConflictException);
    });

    test('debe lanzar HttpException si ocurre un error inesperado', async () => {
      const userId = 'anyUserId';

      jest.spyOn(service, 'remove').mockRejectedValue(new Error('Unknown error'));

      await expect(controller.deleteUser(userId)).rejects.toThrow(HttpException);
    });
  });
});
