import { Controller, Delete, Param, UseGuards } from '@nestjs/common';
import { UserAdminService } from '../service/useradmin.service';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';


@Controller('admin')
@ApiTags("Admin User")
export class UserAdminController {
  constructor(
    private readonly userAdminService: UserAdminService
  ) {}

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(
    @Param('id') id: string
  ) {
    return this.userAdminService.remove(id);
  }

}
