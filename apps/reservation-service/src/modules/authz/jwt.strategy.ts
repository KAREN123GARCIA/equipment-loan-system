import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AppConfigService } from "../config/app-config.service";

export type JwtUser = { sub: string; email?: string; roles?: string[]; iat?: number; exp?: number; aud?: any; iss?: string };

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(cfg: AppConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: cfg.jwtSecret(),
      issuer: cfg.jwtIssuer(),
      audience: cfg.jwtAudience(),
    });
  }
  validate(payload: JwtUser) { return payload; }
}
