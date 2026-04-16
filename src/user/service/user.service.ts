import { ConflictException, Injectable } from '@nestjs/common';
import { User } from '../model/user.model';
import { UpdateUserDTO, UserDTO } from '../interface/user.interface';
import { UserRepository } from "../repository/user.repository";
import { UserMapper } from "../mapper/user.mapper";

@Injectable()
export class UsuariosService {
  constructor(
    private readonly userRepository: UserRepository,
  ) {}
  async getAllUsers(): Promise<UserDTO[]> {
    const user = await this.userRepository.findAll();
    return UserMapper.toDTOs(user);
  }

  async getUser(id: string): Promise<UserDTO>{
    const user: User | null = await this.userRepository.findById(id);
    if (!user) throw new ConflictException("No se puede acceder a la información sobre el usuario buscado");
    return UserMapper.toDTO(user);
  }

  async getUserByEmail(email: string): Promise<{ user: UserDTO | null, message: string }> {
    const user = await this.findByEmail(email);
    if (!user) {
      return {
        user: null,
        message: 'Usuario no encontrado',
      };
    }
    return {
      user: UserMapper.toDTO(user),
      message: 'Usuario encontrado',
    };
  }

  async create(user: UserDTO): Promise<User> {
    const userDB = await this.findByEmail(user.email);
    if (userDB) throw new ConflictException('El usuario ya existe');

    const createdUser = await this.userRepository.create(user);
    await createdUser.save();

    return createdUser;
  }
  

  async updateUser(id: string, updateUser: UpdateUserDTO): Promise<void>{
    const updatedUser = await this.userRepository.update(id, updateUser);
    if (!updatedUser) throw new ConflictException('El usuario a actualizar no se encuentra');
  }

  async remove(id: string): Promise<void> {
    const user = await this.userRepository.delete(id);
    if (!user) throw new ConflictException('Usuario no encontrado');
  }

  private async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findByEmail(email) || null;
  }
}
