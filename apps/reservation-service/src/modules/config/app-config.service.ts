import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AppConfigService {
  constructor(private readonly config: ConfigService) {}

  port(): number { return Number(this.config.get("PORT") ?? "3005"); }
  globalPrefix(): string { return this.config.get("GLOBAL_PREFIX") ?? "api/v1"; }
  corsOrigins(): string[] { return (this.config.get("CORS_ORIGINS") ?? "*").split(",").map((s: string) => s.trim())
.filter(Boolean); }
  authRequired(): boolean { return String(this.config.get("AUTH_REQUIRED") ?? "true").toLowerCase() === "true"; }

  jwtSecret(): string {
    const v = this.config.get<string>("JWT_SECRET"); if (!v) throw new Error("JWT_SECRET missing"); return v;
  }
  jwtIssuer(): string { return this.config.get("JWT_ISSUER") ?? "auth-service"; }
  jwtAudience(): string { return this.config.get("JWT_AUDIENCE") ?? "equipment-loan"; }

  inventoryServiceUrl(): string { return this.config.get("INVENTORY_SERVICE_URL") ?? "http://localhost:3003/api/v1"; }
  usersServiceUrl(): string { return this.config.get("USERS_SERVICE_URL") ?? "http://localhost:3001/api/v1"; }
  httpTimeoutMs(): number { return Number(this.config.get("HTTP_TIMEOUT_MS") ?? "5000"); }

  holdTtlMinutes(): number { return Number(this.config.get("RESERVATION_HOLD_TTL_MINUTES") ?? "30"); }
  expirationScanSeconds(): number { return Number(this.config.get("RESERVATION_EXPIRATION_SCAN_SECONDS") ?? "30"); }

  integrationEventsUrl(): string | undefined { return this.config.get("INTEGRATION_SERVICE_EVENTS_URL") || undefined; }
  eventsSource(): string { return this.config.get("EVENTS_SOURCE") ?? "reservation-service"; }
  metricsPath(): string { return this.config.get("METRICS_PATH") ?? "/metrics"; }
}
