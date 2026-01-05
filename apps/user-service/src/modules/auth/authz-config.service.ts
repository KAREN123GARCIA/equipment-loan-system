import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthzConfigService {
  constructor(private readonly config: ConfigService) {}

  authRequired(): boolean {
    const v = this.config.get<string>("AUTH_REQUIRED") ?? "false";
    return v.toLowerCase() === "true";
  }

  publicRegistration(): boolean {
    const v = this.config.get<string>("PUBLIC_USER_REGISTRATION") ?? "true";
    return v.toLowerCase() === "true";
  }
}
