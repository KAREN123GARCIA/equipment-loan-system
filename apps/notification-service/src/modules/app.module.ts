import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TemplatesModule } from './templates/templates.module';
import { DeliveriesModule } from './deliveries/deliveries.module';
import { HealthModule } from './health/health.module';
import { MetricsModule } from './metrics/metrics.module';
import { AuthzModule } from './security/authz.module';
import { EventsModule } from './events/events.module';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      useFactory: (cfg: ConfigService) => ({ uri: cfg.get('MONGODB_URI') }),
      inject: [ConfigService],
    }),
    SharedModule,
    AuthzModule,
    TemplatesModule,
    DeliveriesModule,
    EventsModule,
    HealthModule,
    MetricsModule,
  ],
})
export class AppModule {}
