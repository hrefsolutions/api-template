import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { UserAdminModule } from '../useradmin/useradmin.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_DEB_URI!, {
      dbName: process.env.NODE_ENV === 'development' ? 'develop' : 'production',
    }),
    UserAdminModule,
  ],
})
export class SeedModule {}
