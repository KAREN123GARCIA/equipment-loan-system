import { Injectable } from "@nestjs/common";
import { z } from "zod";

const S = z.object({
  PORT: z.string().default("3002"),
  GLOBAL_PREFIX: z.string().default("api/v1"),
  CORS_ORIGINS: z.string().default("*"),
  JWT_SECRET: z.string().min(10),
  JWT_ISSUER: z.string().default("auth-service"),
  JWT_AUDIENCE: z.string().default("equipment-loan"),
  ACCESS_TOKEN_TTL_SECONDS: z.string().default("900"),
  REFRESH_TOKEN_TTL_SECONDS: z.string().default("604800")
});

@Injectable()
export class AppConfigService {
  private env = S.parse(process.env);

  port() { return Number(this.env.PORT); }
  globalPrefix() { return this.env.GLOBAL_PREFIX.replace(/^\/+|\/+$/g, ""); }
  corsOrigins(): string[] | true {
    const raw = this.env.CORS_ORIGINS.trim();
    if (raw === "*" || raw.length === 0) return true;
    return raw.split(",").map(s => s.trim()).filter(Boolean);
  }
  jwtSecret() { return this.env.JWT_SECRET; }
  jwtIssuer() { return this.env.JWT_ISSUER; }
  jwtAudience() { return this.env.JWT_AUDIENCE; }
  accessTtl() { return Number(this.env.ACCESS_TOKEN_TTL_SECONDS); }
  refreshTtl() { return Number(this.env.REFRESH_TOKEN_TTL_SECONDS); }
}
