import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('AdminService');
  const config = app.get(ConfigService);

  app.setGlobalPrefix('v1', { exclude: ['health', 'health/ready'] });

  const isProduction = config.get<boolean>('isProduction');
  const corsOrigins = config.get<string[]>('corsOrigins') ?? [];
  app.enableCors({
    origin: isProduction ? corsOrigins : true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  const port = config.get<number>('port') ?? 3004;
  await app.listen(port);
  logger.log(`Admin service running on port ${port}`);
}

bootstrap();
