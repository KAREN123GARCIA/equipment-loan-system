import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './modules/app.module';
import { setupSwagger } from './shared/swagger';
import { HttpExceptionFilter } from './shared/http-exception.filter';
import { CorrelationIdMiddleware } from './shared/correlation-id.middleware';
import { LoggerService } from './shared/logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const config = app.get(ConfigService);
  const logger = app.get(LoggerService);

  app.useLogger(logger);
  app.use(helmet());
  app.use(compression());

  app.use(new CorrelationIdMiddleware().use);

  const globalPrefix = config.get('GLOBAL_PREFIX') || 'api/v1';
  app.setGlobalPrefix(globalPrefix);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new HttpExceptionFilter(logger));

  app.enableCors({
    origin: (config.get('CORS_ORIGINS') || '*').split(','),
    credentials: true,
  });

  setupSwagger(app, globalPrefix);

  const port = Number(config.get('PORT') || 3006);
  await app.listen(port);
  logger.info({ msg: `[notification-service] Listening on http://localhost:${port}/${globalPrefix}` });
}
bootstrap();
