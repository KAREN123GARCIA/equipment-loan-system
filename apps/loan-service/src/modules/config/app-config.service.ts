import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AppConfigService {
  constructor(private readonly config: ConfigService) {}

  port(): number {
    return Number(this.config.get<string>("PORT") ?? 3004);
  }

  globalPrefix(): string {
    return this.config.get<string>("GLOBAL_PREFIX") ?? "api/v1";
  }

  authRequired(): boolean {
    return (this.config.get<string>("AUTH_REQUIRED") ?? "true") === "true";
  }

  jwtSecret(): string {
    return this.config.get<string>("JWT_SECRET") ?? "dev-secret-change-me";
  }

  jwtIssuer(): string | undefined {
    return this.config.get<string>("JWT_ISSUER") ?? "auth-service";
  }

  jwtAudience(): string | undefined {
    return this.config.get<string>("JWT_AUDIENCE") ?? "equipment-loan";
  }

  usersServiceUrl(): string {
    return this.config.get<string>("USERS_SERVICE_URL") ?? "http://localhost:3001/api/v1";
  }

  inventoryServiceUrl(): string {
    return this.config.get<string>("INVENTORY_SERVICE_URL") ?? "http://localhost:3003/api/v1";
  }
  httpTimeoutMs(): number {
  return Number(this.config.get<string>("HTTP_TIMEOUT_MS") ?? 5000);
}


}
