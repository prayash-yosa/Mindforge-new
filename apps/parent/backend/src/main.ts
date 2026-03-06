import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('ParentService');
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);
  const port = config.get<number>('port') ?? 3002;
  const isProduction = config.get<boolean>('isProduction');
  const corsOrigins = config.get<string[]>('corsOrigins') ?? ['http://localhost:5174'];

  if (config.get<boolean>('trustProxy')) {
    const expressApp = app.getHttpAdapter().getInstance();
    expressApp.set('trust proxy', 1);
  }

  app.use(helmet());

  app.enableCors({
    origin: isProduction ? corsOrigins : true, // Allow mobile (Expo, emulator) in dev
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    credentials: true,
    maxAge: 86400,
  });

  app.setGlobalPrefix('v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      errorHttpStatusCode: 400,
    }),
  );

  if (!isProduction) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Mindforge Parent Service API')
      .setDescription('REST API for the Mindforge Parent application. Read-only access to child progress, attendance, fees.')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('Health', 'Service health check')
      .addTag('Auth', 'Parent login')
      .addTag('Profile', 'Parent and child profile')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);
    logger.log(`OpenAPI docs: http://localhost:${port}/api/docs`);
  }

  app.enableShutdownHooks();

  await app.listen(port);

  logger.log('=== Parent Service Startup ===');
  logger.log(`Port: ${port}`);
  logger.log(`CORS: ${corsOrigins.join(', ')}`);
  logger.log('==============================');
}

bootstrap();
