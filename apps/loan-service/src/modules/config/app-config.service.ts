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
    if (!v) throw new Error("JWT_SECRET is missing in loan-service .env");
    return v;
  }

  jwtIssuer(): string {
    return this.config.get<string>("JWT_ISSUER") ?? "auth-service";
  }

  jwtAudience(): string {
    return this.config.get<string>("JWT_AUDIENCE") ?? "equipment-loan";
  }

  port(): number {
    return Number(this.config.get<string>("PORT") ?? "3004");
  }

  globalPrefix(): string {
    return this.config.get<string>("GLOBAL_PREFIX") ?? "api/v1";
  }

  corsOrigins(): string[] {
    const raw = this.config.get<string>("CORS_ORIGINS") ?? "*";
    return raw.split(",").map((s) => s.trim()).filter(Boolean);
  }

  databaseUrl(): string {
    const v = this.config.get<string>("DATABASE_URL");
    if (!v) throw new Error("DATABASE_URL is missing in loan-service .env");
    return v;
  }

  usersServiceUrl(): string {
    const v = this.config.get<string>("USERS_SERVICE_URL");
    if (!v) throw new Error("USERS_SERVICE_URL is missing in loan-service .env");
    return v.replace(/\/+$/, "");
  }

  inventoryServiceUrl(): string {
    const v = this.config.get<string>("INVENTORY_SERVICE_URL");
    if (!v) throw new Error("INVENTORY_SERVICE_URL is missing in loan-service .env");
    return v.replace(/\/+$/, "");
  }

  httpTimeoutMs(): number {
    return Number(this.config.get<string>("HTTP_TIMEOUT_MS") ?? "5000");
  }
}
