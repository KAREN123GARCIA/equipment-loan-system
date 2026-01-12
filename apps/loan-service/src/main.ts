import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './modules/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  const globalPrefix = config.get('GLOBAL_PREFIX') || 'api/v1';
  app.setGlobalPrefix(globalPrefix);

  const authRequired = config.get('AUTH_REQUIRED') === 'true';

  // 👉 Modo DEV (sin auth real)
  if (!authRequired) {
    app.use((req: any, _res: any, next: any) => {
      const userId = req.headers['x-user-id'];
      if (userId) {
        req.user = { sub: userId, roles: ['ADMIN'] };
      }
      next();
    });
  }

  await app.listen(Number(config.get('PORT') || 3004));
}
bootstrap();
