import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, ConflictException } from '@nestjs/common';
import { UserAdminController } from '../useradmin/controller/useradmin.controller';
import { UserAdminService } from '../useradmin/service/useradmin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserAdminDTO } from '../useradmin/interface/useradmin.interface';

describe('UserAdminController', () => {
  let controller: UserAdminController;
  let service: UserAdminService;

  const mockUserAdminService = {
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserAdminController],
      providers: [
        {
          provide: UserAdminService,
          useValue: mockUserAdminService,
        },
      ],
    })
    .overrideGuard(JwtAuthGuard)
    .useValue({ canActivate: jest.fn(() => true) })
    .compile();

    controller = module.get<UserAdminController>(UserAdminController);
    service = module.get<UserAdminService>(UserAdminService);
  });

  test('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('remove', () => {
    test('debe eliminar un usuario si el id es válido', async () => {
      const userId = 'validUserId';

      jest.spyOn(service, 'remove').mockResolvedValue(undefined as unknown as UserAdminDTO);

      const result = await controller.remove(userId);
      expect(result).toEqual(undefined);
    });

    test('debe lanzar HttpException si el usuario no es encontrado', async () => {
      const userId = 'invalidUserId';

      jest.spyOn(service, 'remove').mockRejectedValue(new ConflictException());

      await expect(controller.remove(userId)).rejects.toThrow(HttpException);
    });

    test('debe lanzar HttpException si ocurre un error inesperado', async () => {
      const userId = 'anyUserId';

      jest.spyOn(service, 'remove').mockRejectedValue(new Error('Unknown error'));

      await expect(controller.remove(userId)).rejects.toThrow(Error);
    });
  });
});
