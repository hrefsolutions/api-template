import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { UserAdminService } from '../useradmin/service/useradmin.service';
import { SeedModule } from './seed.module';

const ADMIN_EMAIL = 'admin@admin.com';
const ADMIN_PASSWORD = 'admin123';

async function bootstrap() {
  const logger = new Logger('SeedAdmin');
  const app = await NestFactory.createApplicationContext(SeedModule, {
    logger: ['error', 'warn', 'log'],
  });

  const userAdminService = app.get(UserAdminService);
  const existing = await userAdminService.findByEmail(ADMIN_EMAIL);
  if (existing) {
    logger.log(`El administrador ya existe (${ADMIN_EMAIL}), no se hace nada.`);
    await app.close();
    return;
  }

  await userAdminService.create({
    name: 'Administrador',
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    enabled: true,
  });
  logger.log(`Administrador creado: ${ADMIN_EMAIL}`);
  await app.close();
}

bootstrap().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
