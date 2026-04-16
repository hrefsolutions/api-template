import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserAdminDTO } from '../interface/useradmin.interface';
import * as bcrypt from 'bcrypt';

@Schema()
export class UserAdmin extends Document implements UserAdminDTO {
    @Prop()
    name!: string;

    @Prop()
    email!: string;

    @Prop()
    password!: string;

    @Prop({ default: true })
    enabled!: boolean;
}

export const UserAdminSchema = SchemaFactory.createForClass(UserAdmin);

UserAdminSchema.pre('save', async function () {
  if (this.isModified('password')) {
    const hashedPassword = await bcrypt.hash(this.password, 10);
    this.password = hashedPassword;
  }
});
