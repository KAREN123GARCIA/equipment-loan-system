import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

export type JwtPayload = {
  sub: string;
  email?: string;
  username?: string;
  roles?: string[];   // preferred
  role?: string;      // fallback
  iss?: string;
  aud?: string | string[];
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>("JWT_SECRET") ?? "dev_only_change_me",
      issuer: config.get<string>("JWT_ISSUER") ?? undefined,
      audience: config.get<string>("JWT_AUDIENCE") ?? undefined,
    });
  }

  async validate(payload: JwtPayload) {
    // Attach payload to request.user
    return payload;
  }
}
