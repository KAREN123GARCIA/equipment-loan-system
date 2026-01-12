import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const cfg = app.get(ConfigService);

  const prefix = cfg.get<string>("GLOBAL_PREFIX", "api/v1");
  app.setGlobalPrefix(prefix);

  // CORS simple en dev (si quieres)
  const corsOrigins = cfg.get<string>("CORS_ORIGINS", "*");
  app.enableCors({
    origin: corsOrigins === "*" ? true : corsOrigins.split(",").map(s => s.trim()),
    credentials: true,
    exposedHeaders: ["X-Correlation-Id"],
  });

  const port = Number(cfg.get("PORT", 3002));
  await app.listen(port);

  console.log(`[auth-service] Listening on http://localhost:${port}/${prefix}`);
}

bootstrap();
