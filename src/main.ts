import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Logger } from '@nestjs/common';


async function bootstrap() {
  const logger = new Logger('Main');
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );


  app.enableCors({
    origin: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle("API-NOMBRE_EMPRESA - HREF")
    .setVersion("3.0.0")
    .build();

  const document = SwaggerModule.createDocument(app,config);
  SwaggerModule.setup('api-docs', app, document)


  await app.listen(process.env.PORT!,'0.0.0.0');
  logger.log(`Server is running on port ${process.env.PORT}`);
}
bootstrap();
