import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { JwtStrategy } from "./jwt.strategy";
import { AuthzConfigService } from "./authz-config.service";

@Module({
  imports: [PassportModule],
  providers: [JwtStrategy, AuthzConfigService],
  exports: [AuthzConfigService],
})
export class AuthModule {}
