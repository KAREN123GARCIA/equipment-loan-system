import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AppConfigService } from "../config/app-config.service";

export type JwtUser = {
  sub: string;
  email?: string;
  roles?: string[];
  iat?: number;
  exp?: number;
  aud?: string | string[];
  iss?: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly cfg: AppConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: cfg.jwtSecret(),
      issuer: cfg.jwtIssuer(),
      audience: cfg.jwtAudience(),
    });
  }

  async validate(payload: JwtUser): Promise<JwtUser> {
    if (!payload?.sub) throw new UnauthorizedException("Invalid token.");
    return payload;
  }
}
