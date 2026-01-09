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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_service_1 = require("../prisma/prisma.service");
const plusSeconds = (s) => new Date(Date.now() + s * 1000);
let AuthService = class AuthService {
    prisma;
    jwt;
    cfg;
    constructor(prisma, jwt, cfg) {
        this.prisma = prisma;
        this.jwt = jwt;
        this.cfg = cfg;
    }
    accessTtl() {
        return Number(this.cfg.get("ACCESS_TOKEN_TTL_SECONDS", 900));
    }
    refreshTtl() {
        return Number(this.cfg.get("REFRESH_TOKEN_TTL_SECONDS", 604800));
    }
    jwtSecret() {
        return String(this.cfg.get("JWT_SECRET", "dev_only_change_me"));
    }
    jwtIssuer() {
        return String(this.cfg.get("JWT_ISSUER", "auth-service"));
    }
    jwtAudience() {
        return String(this.cfg.get("JWT_AUDIENCE", "equipment-loan"));
    }
    async login(email, password) {
        const user = await this.prisma.user.findUnique({
            where: { email },
            include: { roles: true },
        });
        if (!user)
            throw new common_1.UnauthorizedException("Invalid credentials.");
        if (!(await bcrypt_1.default.compare(password, user.passwordHash))) {
            throw new common_1.UnauthorizedException("Invalid credentials.");
        }
        const roles = user.roles.map((r) => r.role);
        const accessToken = await this.jwt.signAsync({ sub: user.id, email: user.email, roles }, {
            secret: this.jwtSecret(),
            issuer: this.jwtIssuer(),
            audience: this.jwtAudience(),
            expiresIn: this.accessTtl(),
        });
        const refreshToken = await this.jwt.signAsync({ sub: user.id, type: "refresh" }, {
            secret: this.jwtSecret(),
            issuer: this.jwtIssuer(),
            audience: this.jwtAudience(),
            expiresIn: this.refreshTtl(),
        });
        await this.prisma.refreshToken.create({
            data: {
                userId: user.id,
                tokenHash: await bcrypt_1.default.hash(refreshToken, 10),
                expiresAt: plusSeconds(this.refreshTtl()),
            },
        });
        return {
            tokenType: "Bearer",
            accessToken,
            expiresIn: this.accessTtl(),
            refreshToken,
            user: { id: user.id, email: user.email, roles },
        };
    }
    async refresh(refreshToken) {
        let decoded;
        try {
            decoded = await this.jwt.verifyAsync(refreshToken, {
                secret: this.jwtSecret(),
                issuer: this.jwtIssuer(),
                audience: this.jwtAudience(),
            });
        }
        catch {
            throw new common_1.UnauthorizedException("Invalid refresh token.");
        }
        const userId = String(decoded?.sub ?? "");
        if (!userId)
            throw new common_1.UnauthorizedException("Invalid refresh token.");
        const tokens = await this.prisma.refreshToken.findMany({
            where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
            orderBy: { expiresAt: "desc" },
            take: 25,
        });
        const ok = await Promise.any(tokens.map((t) => bcrypt_1.default.compare(refreshToken, t.tokenHash))).catch(() => false);
        if (!ok)
            throw new common_1.UnauthorizedException("Invalid refresh token.");
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { roles: true },
        });
        if (!user)
            throw new common_1.UnauthorizedException("Invalid refresh token.");
        const roles = user.roles.map((r) => r.role);
        const accessToken = await this.jwt.signAsync({ sub: user.id, email: user.email, roles }, {
            secret: this.jwtSecret(),
            issuer: this.jwtIssuer(),
            audience: this.jwtAudience(),
            expiresIn: this.accessTtl(),
        });
        return {
            tokenType: "Bearer",
            accessToken,
            expiresIn: this.accessTtl(),
            user: { id: user.id, email: user.email, roles },
        };
    }
    async logout(refreshToken) {
        const last = await this.prisma.refreshToken.findMany({
            where: { revokedAt: null },
            take: 50,
            orderBy: { expiresAt: "desc" },
        });
        for (const t of last) {
            if (await bcrypt_1.default.compare(refreshToken, t.tokenHash)) {
                await this.prisma.refreshToken.update({
                    where: { id: t.id },
                    data: { revokedAt: new Date() },
                });
                break;
            }
        }
        return { ok: true };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map