import { BadRequestException, Body, ConflictException, Controller, Get, HttpException, HttpStatus, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request } from 'express';
import { UserAdminDTO } from '../../useradmin/interface/useradmin.interface';
import { UserAdminService } from '../../useradmin/service/useradmin.service';
import { JwtAuthGuard } from '../jwt-auth.guard';

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userAdminService: UserAdminService,
  ) {}

  @Get("verify-token")
  @UseGuards(JwtAuthGuard)
  async verifyToken(@Req() req: Request) {
    return { message: "Token aún válido.", user: req.user };
  }

  @Post("login")
  async login(@Body() bodyLogin: UserAdminDTO) {
    try {
      const user = await this.authService.validateUser(
        bodyLogin.email,
        bodyLogin.password,
      );

      if (!user) {
        throw new UnauthorizedException("Credenciales inválidas.");
      }

      return this.authService.login(user);
    } catch (error: any) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post("register")
  @UseGuards(JwtAuthGuard)
  async register(@Body() body: UserAdminDTO) {
    if (!body.email || !body.name || !body.password) {
      throw new BadRequestException("Faltan campos obligatorios");
    }

    try {
      await this.userAdminService.create(body);
      return {
        status: HttpStatus.CREATED,
        message: "Usuario creado correctamente",
      };
    } catch (error: any) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}