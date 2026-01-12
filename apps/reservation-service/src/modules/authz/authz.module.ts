import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { AppConfigModule } from "../config/app-config.module";
import { AppConfigService } from "../config/app-config.service";
import { JwtStrategy } from "./jwt.strategy";
import { AuthzConfigService } from "./authz-config.service";
import { JwtOptionalGuard } from "./jwt-optional.guard";
import { RolesGuard } from "./roles.guard";

@Module({
  imports: [
    AppConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: (cfg: AppConfigService) => ({
        secret: cfg.jwtSecret(),
        signOptions: { issuer: cfg.jwtIssuer(), audience: cfg.jwtAudience() },
      }),
    }),
  ],
  providers: [JwtStrategy, AuthzConfigService, JwtOptionalGuard, RolesGuard],
  exports: [JwtOptionalGuard, RolesGuard, AuthzConfigService],
})
export class AuthzModule {}
