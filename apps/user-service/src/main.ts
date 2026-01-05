import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import helmet from "helmet";
import pinoHttp from "pino-http";
import { randomUUID } from "crypto";

import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";

function parseCors(origins: string | undefined): string[] | true {
  if (!origins || origins.trim() === "" || origins.trim() === "*") return true;
  return origins.split(",").map((o) => o.trim()).filter(Boolean);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const config = app.get(ConfigService);

  const globalPrefix = config.get<string>("GLOBAL_PREFIX") ?? "api/v1";
  app.setGlobalPrefix(globalPrefix);

  // Security headers (Gateway should also enforce perimeter policies)
  app.use(helmet());

  // CORS (usually handled at Gateway; kept here for local dev)
  const corsOrigins = parseCors(config.get<string>("CORS_ORIGINS"));
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-Correlation-Id"],
    exposedHeaders: ["X-Correlation-Id"],
  });

  // Correlation ID + structured logging
  app.use((req: any, res: any, next: any) => {
    const header = req.headers["x-correlation-id"];
    const correlationId = (typeof header === "string" && header) || randomUUID();
    req.correlationId = correlationId;
    res.setHeader("X-Correlation-Id", correlationId);
    next();
  });

  app.use(
    pinoHttp({
      level: config.get<string>("LOG_LEVEL") ?? "info",
      redact: ["req.headers.authorization"],
      customProps: (req) => ({ correlationId: (req as any).correlationId }),
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger (OpenAPI)
  const swaggerConfig = new DocumentBuilder()
    .setTitle("user-service")
    .setDescription("User CRUD and Role Assignment microservice (Equipment Loan Management System)")
    .setVersion("1.0.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${globalPrefix}/docs`, app, document);

  const port = Number(config.get("PORT") ?? 3001);
  await app.listen(port);
}

bootstrap();
