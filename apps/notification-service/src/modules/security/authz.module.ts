import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { AuthzConfigService } from './authz-config.service';
import { JwtOptionalGuard } from './jwt-optional.guard';
import { RolesGuard } from './roles.guard';

@Module({
  imports: [PassportModule],
  providers: [AuthzConfigService, JwtStrategy, JwtOptionalGuard, RolesGuard],
  exports: [AuthzConfigService, JwtOptionalGuard, RolesGuard],
})
export class AuthzModule {}
