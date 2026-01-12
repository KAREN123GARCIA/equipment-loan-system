import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { AppConfigModule } from "../config/app-config.module";
import { AppConfigService } from "../config/app-config.service";
import { JwtStrategy } from "./jwt.strategy";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { RolesGuard } from "./guards/roles.guard";
import { APP_GUARD } from "@nestjs/core";

@Module({
  imports: [
    PassportModule,
    AppConfigModule,
    JwtModule.registerAsync({
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: (cfg: AppConfigService) => ({
        secret: cfg.jwtSecret(),
        signOptions: {
          issuer: cfg.jwtIssuer(),
          audience: cfg.jwtAudience(),
        },
      }),
    }),
  ],
  providers: [
    JwtStrategy,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
  exports: [JwtModule],
})
export class AuthzModule {}
