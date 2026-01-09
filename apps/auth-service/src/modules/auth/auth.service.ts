import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";

const plusSeconds = (s: number) => new Date(Date.now() + s * 1000);

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly cfg: ConfigService, 
  ) {}

  private accessTtl(): number {
    return Number(this.cfg.get("ACCESS_TOKEN_TTL_SECONDS", 900));
  }

  private refreshTtl(): number {
    return Number(this.cfg.get("REFRESH_TOKEN_TTL_SECONDS", 604800));
  }

  private jwtSecret(): string {
    return String(this.cfg.get("JWT_SECRET", "dev_only_change_me"));
  }

  private jwtIssuer(): string {
    return String(this.cfg.get("JWT_ISSUER", "auth-service"));
  }

  private jwtAudience(): string {
    return String(this.cfg.get("JWT_AUDIENCE", "equipment-loan"));
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { roles: true },
    });

    if (!user) throw new UnauthorizedException("Invalid credentials.");
    if (!(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException("Invalid credentials.");
    }

    const roles = user.roles.map((r: { role: string }) => r.role);

    const accessToken = await this.jwt.signAsync(
      { sub: user.id, email: user.email, roles },
      {
        secret: this.jwtSecret(),
        issuer: this.jwtIssuer(),
        audience: this.jwtAudience(),
        expiresIn: this.accessTtl(),
      },
    );

    const refreshToken = await this.jwt.signAsync(
      { sub: user.id, type: "refresh" },
      {
        secret: this.jwtSecret(),
        issuer: this.jwtIssuer(),
        audience: this.jwtAudience(),
        expiresIn: this.refreshTtl(),
      },
    );

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: await bcrypt.hash(refreshToken, 10),
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

  async refresh(refreshToken: string) {
    let decoded: any;

    try {
      decoded = await this.jwt.verifyAsync(refreshToken, {
        secret: this.jwtSecret(),
        issuer: this.jwtIssuer(),
        audience: this.jwtAudience(),
      });
    } catch {
      throw new UnauthorizedException("Invalid refresh token.");
    }

    const userId = String(decoded?.sub ?? "");
    if (!userId) throw new UnauthorizedException("Invalid refresh token.");

    const tokens = await this.prisma.refreshToken.findMany({
      where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { expiresAt: "desc" },
      take: 25,
    });

    const ok = await Promise.any(
      tokens.map((t: { tokenHash: string }) => bcrypt.compare(refreshToken, t.tokenHash)),
    ).catch(() => false);

    if (!ok) throw new UnauthorizedException("Invalid refresh token.");

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { roles: true },
    });

    if (!user) throw new UnauthorizedException("Invalid refresh token.");

    const roles = user.roles.map((r: { role: string }) => r.role);

    const accessToken = await this.jwt.signAsync(
      { sub: user.id, email: user.email, roles },
      {
        secret: this.jwtSecret(),
        issuer: this.jwtIssuer(),
        audience: this.jwtAudience(),
        expiresIn: this.accessTtl(),
      },
    );

    return {
      tokenType: "Bearer",
      accessToken,
      expiresIn: this.accessTtl(),
      user: { id: user.id, email: user.email, roles },
    };
  }

  async logout(refreshToken: string) {
    const last = await this.prisma.refreshToken.findMany({
      where: { revokedAt: null },
      take: 50,
      orderBy: { expiresAt: "desc" },
    });

    for (const t of last) {
      if (await bcrypt.compare(refreshToken, t.tokenHash)) {
        await this.prisma.refreshToken.update({
          where: { id: t.id },
          data: { revokedAt: new Date() },
        });
        break;
      }
    }

    return { ok: true };
  }
}
