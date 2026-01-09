import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AppConfigService {
  constructor(private readonly config: ConfigService) {}

   authRequired(): boolean {
    const v = this.config.get<string>("AUTH_REQUIRED", "true");
    return String(v).toLowerCase() === "true";
  }

  jwtSecret(): string {
    const v = this.config.get<string>("JWT_SECRET");
    if (!v) throw new Error("JWT_SECRET is missing in inventory-service .env");
    return v;
  }

  jwtIssuer(): string {
    return this.config.get<string>("JWT_ISSUER") ?? "auth-service";
  }

  jwtAudience(): string {
    return this.config.get<string>("JWT_AUDIENCE") ?? "equipment-loan";
  }

  port(): number {
    return Number(this.config.get<string>("PORT") ?? "3003");
  }

  globalPrefix(): string {
    return this.config.get<string>("GLOBAL_PREFIX") ?? "api/v1";
  }

  corsOrigins(): string[] {
    const raw = this.config.get<string>("CORS_ORIGINS") ?? "*";
    return raw.split(",").map(s => s.trim()).filter(Boolean);
  }
  
}
