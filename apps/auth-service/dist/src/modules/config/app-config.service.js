"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppConfigService = void 0;
const common_1 = require("@nestjs/common");
const zod_1 = require("zod");
const S = zod_1.z.object({
    PORT: zod_1.z.string().default("3002"),
    GLOBAL_PREFIX: zod_1.z.string().default("api/v1"),
    CORS_ORIGINS: zod_1.z.string().default("*"),
    JWT_SECRET: zod_1.z.string().min(10),
    JWT_ISSUER: zod_1.z.string().default("auth-service"),
    JWT_AUDIENCE: zod_1.z.string().default("equipment-loan"),
    ACCESS_TOKEN_TTL_SECONDS: zod_1.z.string().default("900"),
    REFRESH_TOKEN_TTL_SECONDS: zod_1.z.string().default("604800")
});
let AppConfigService = class AppConfigService {
    env = S.parse(process.env);
    port() { return Number(this.env.PORT); }
    globalPrefix() { return this.env.GLOBAL_PREFIX.replace(/^\/+|\/+$/g, ""); }
    corsOrigins() {
        const raw = this.env.CORS_ORIGINS.trim();
        if (raw === "*" || raw.length === 0)
            return true;
        return raw.split(",").map(s => s.trim()).filter(Boolean);
    }
    jwtSecret() { return this.env.JWT_SECRET; }
    jwtIssuer() { return this.env.JWT_ISSUER; }
    jwtAudience() { return this.env.JWT_AUDIENCE; }
    accessTtl() { return Number(this.env.ACCESS_TOKEN_TTL_SECONDS); }
    refreshTtl() { return Number(this.env.REFRESH_TOKEN_TTL_SECONDS); }
};
exports.AppConfigService = AppConfigService;
exports.AppConfigService = AppConfigService = __decorate([
    (0, common_1.Injectable)()
], AppConfigService);
//# sourceMappingURL=app-config.service.js.map