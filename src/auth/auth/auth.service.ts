import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserAdmin } from '../../useradmin/model/useradmin.model';
import { UserAdminService } from '../../useradmin/service/useradmin.service';
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
  constructor(
    private readonly userAdminService: UserAdminService,
    private readonly jwtService: JwtService
  ) {}

  async validateUserFromPayload(payload: any): Promise<UserAdmin | null> {
    const email = payload.email;
    const user = await this.userAdminService.findByEmail(email);
    return user || null;
  }

  async login(user: UserAdmin) {
    const payload = { sub: user._id, email: user.email };
    const access_token = await this.jwtService.signAsync(payload);
    return { access_token };
  }

  async validateUser(email: string, password: string): Promise<UserAdmin | null> {
    const user = await this.userAdminService.findByEmail(email);
    if (user && (await this.comparePasswords(password, user.password))) {
      return user;
    }
    return null;
  }

  private async comparePasswords(inputPassword: string, hashedPassword: string ): Promise<boolean> {
    return bcrypt.compare(inputPassword, hashedPassword);
  }
}
