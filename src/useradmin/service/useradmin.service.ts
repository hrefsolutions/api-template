import { Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UserAdminDTO } from '../interface/useradmin.interface';
import { UserAdmin } from '../model/useradmin.model';


@Injectable()
export class UserAdminService {
  constructor(
    @InjectModel('UserAdmin') private readonly userAdminModel: Model<UserAdmin>
  ) {}

  async create(createUserDto: UserAdminDTO): Promise<UserAdminDTO> {
    const createdUser = new this.userAdminModel(createUserDto);
    const newUser = await createdUser.save();
    return await newUser.save();
  }

  async remove(id: string): Promise<UserAdminDTO> {
    const user = await this.userAdminModel.findByIdAndDelete(id).lean();
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }
  async findByEmail(email: string): Promise<UserAdmin | null> {
    return await this.userAdminModel.findOne({ email: email }).exec() || null;
  }
}
