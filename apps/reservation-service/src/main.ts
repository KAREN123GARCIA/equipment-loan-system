import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import helmet from "helmet";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./modules/app.module";
import { AppConfigService } from "./modules/config/app-config.service";
import { GlobalExceptionFilter } from "./modules/common/filters/global-exception.filter";
import { CorrelationIdMiddleware } from "./modules/common/middleware/correlation-id.middleware";
import { JsonLogger } from "./modules/common/logging/json-logger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true, logger: new JsonLogger() });
  app.use(helmet());
  app.use(CorrelationIdMiddleware());
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));

  const cfg = app.get(AppConfigService);
  const origins = cfg.corsOrigins();
  if (origins.includes("*")) app.enableCors({ origin: true, credentials: true });
  else app.enableCors({ origin: origins, credentials: true });

  app.setGlobalPrefix(cfg.globalPrefix());

  const swaggerCfg = new DocumentBuilder()
    .setTitle("reservation-service")
    .setDescription("Reservation Service API for Equipment Loan Management System")
    .setVersion("1.0.0")
    .addBearerAuth()
    .build();
  const doc = SwaggerModule.createDocument(app, swaggerCfg);
  SwaggerModule.setup(`${cfg.globalPrefix()}/docs`, app, doc);

  await app.listen(cfg.port());
  console.log(`[reservation-service] Listening on http://localhost:${cfg.port()}/${cfg.globalPrefix()}`);
}
bootstrap();
