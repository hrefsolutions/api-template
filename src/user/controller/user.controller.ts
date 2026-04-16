import { Controller, Post, Body, HttpStatus, HttpException, ConflictException, Get, Put, Delete, Param } from '@nestjs/common';
import { UsuariosService } from '../service/user.service';
import { UpdateUserDTO, UserDTO } from '../interface/user.interface';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) { }

  @Get()
  async getUsers(): Promise<UserDTO[]> {
    return await this.usuariosService.getAllUsers();
  }

  @Post()
  async createUser(
    @Body() userDTO: UserDTO
  ) {
    return this.usuariosService.create(userDTO)
      .then((user) => ({
        status: HttpStatus.CREATED,
        message: 'Usuario creado correctamente',
        data: user
      }))
      .catch((error) => {
        if (error instanceof ConflictException) {
          throw error;
        }
        throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
      });
  }

  @Post('email')
  async getUserByEmail(
    @Body() body: {email: string}
  ) {
    return await this.usuariosService.getUserByEmail(body.email)
  }

  @Put("update/:id")
  async updateUser(
    @Param("id") id: string,
    @Body() updateUser: UpdateUserDTO
  ){
    return this.usuariosService.updateUser(id, updateUser)
      .then(() => ({
        status: HttpStatus.OK,
        message: 'Usuario actualizado correctamente'
      }))
      .catch((error) => {
        if (error instanceof ConflictException) {
          throw error;
        }
        throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
      });
  }

  @Delete(":id")
  async deleteUser(
    @Param("id") id: string
  ){
    return this.usuariosService.remove(id)
      .then(() => ({
        status: HttpStatus.OK,
        message: 'Usuario eliminado correctamente'
      }))
      .catch((error) => {
        if (error instanceof ConflictException) {
          throw error;
        }
        throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
      });
  }
}
