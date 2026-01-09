"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppConfigService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let AppConfigService = class AppConfigService {
    config;
    constructor(config) {
        this.config = config;
    }
    authRequired() {
        const v = this.config.get("AUTH_REQUIRED", "true");
        return String(v).toLowerCase() === "true";
    }
    jwtSecret() {
        const v = this.config.get("JWT_SECRET");
        if (!v)
            throw new Error("JWT_SECRET is missing in loan-service .env");
        return v;
    }
    jwtIssuer() {
        return this.config.get("JWT_ISSUER") ?? "auth-service";
    }
    jwtAudience() {
        return this.config.get("JWT_AUDIENCE") ?? "equipment-loan";
    }
    port() {
        return Number(this.config.get("PORT") ?? "3004");
    }
    globalPrefix() {
        return this.config.get("GLOBAL_PREFIX") ?? "api/v1";
    }
    corsOrigins() {
        const raw = this.config.get("CORS_ORIGINS") ?? "*";
        return raw.split(",").map((s) => s.trim()).filter(Boolean);
    }
    databaseUrl() {
        const v = this.config.get("DATABASE_URL");
        if (!v)
            throw new Error("DATABASE_URL is missing in loan-service .env");
        return v;
    }
    usersServiceUrl() {
        const v = this.config.get("USERS_SERVICE_URL");
        if (!v)
            throw new Error("USERS_SERVICE_URL is missing in loan-service .env");
        return v.replace(/\/+$/, "");
    }
    inventoryServiceUrl() {
        const v = this.config.get("INVENTORY_SERVICE_URL");
        if (!v)
            throw new Error("INVENTORY_SERVICE_URL is missing in loan-service .env");
        return v.replace(/\/+$/, "");
    }
    httpTimeoutMs() {
        return Number(this.config.get("HTTP_TIMEOUT_MS") ?? "5000");
    }
};
exports.AppConfigService = AppConfigService;
exports.AppConfigService = AppConfigService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AppConfigService);
//# sourceMappingURL=app-config.service.js.map