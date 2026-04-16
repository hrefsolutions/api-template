import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import { User } from "../model/user.model";
import {
  CreateUserDTO,
  UpdateUserDTO,
} from "@src/user/interface/user.interface";
import {Model} from "mongoose";


@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async create(user: CreateUserDTO): Promise<User> {
    return new this.userModel(user).save();
  }

  async update(id: string, updateData: UpdateUserDTO): Promise<User | null> {
    return this.userModel
      .findByIdAndUpdate(id, updateData, { returnDocument: "after" })
      .exec();
  }

  async delete(id: string): Promise<User | null> {
    return this.userModel.findByIdAndDelete(id).exec();
  }
}