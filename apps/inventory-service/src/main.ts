import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./modules/app.module";
import { AppConfigService } from "./modules/config/app-config.service";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const cfg = app.get(AppConfigService);

  const origins = cfg.corsOrigins();
  if (origins.includes("*")) {
    app.enableCors({ origin: true, credentials: true });
  } else {
    app.enableCors({ origin: origins, credentials: true });
  }

  app.setGlobalPrefix(cfg.globalPrefix());

  const port = cfg.port();
  await app.listen(port);
  console.log(`[inventory-service] Listening on http://localhost:${port}/${cfg.globalPrefix()}`);
}

bootstrap();
