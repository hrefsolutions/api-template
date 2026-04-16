import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { OrderDTO } from '../../order/interface/order.interface';

@Schema()
export class User extends Document {

  @Prop({unique: true})
  email!: string;

  @Prop()
  name!: string;

  @Prop()
  last_name!: string;

  @Prop()
  fullName!: string;

  @Prop()
  dni!: number;

  @Prop()
  phone!: number;

  @Prop({ type: [{ type: Object }], default: [] })
  orders!: OrderDTO[];

  @Prop({default: "https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png"})
  avatar?: string;

  @Prop()
  dniFrontImage?: string;

  @Prop()
  dniBackImage?: string;

  @Prop({default: true})
  enabled!: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Anotaciones: Esto sirve para generar un indice el cual se le aplica un filtro para que solo se puedan crear DNIs mayores a 1000. Los menores a 1000 no son contemplados por el unique
UserSchema.index(
  { dni: 1 },
  {
    unique: true,
    partialFilterExpression: { dni: { $gte: 1000 } }, // Aplica solo para DNIs >= 1000
  }
);

