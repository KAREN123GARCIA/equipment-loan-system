import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AppConfigService } from "../config/app-config.service";

export type JwtPayload = { sub: string; email: string; roles?: string[]; iat?: number; exp?: number };

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
  validate(payload: JwtPayload) { return payload; }
}
