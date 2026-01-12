import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication, prefix: string) {
  const config = new DocumentBuilder()
    .setTitle('notification-service')
    .setDescription('Notification service API')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const doc = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${prefix}/docs`, app, doc);
}
