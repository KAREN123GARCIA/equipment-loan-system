import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "./roles.decorator";
import { IS_PUBLIC_KEY } from "./public.decorator";
import type { JwtPayload } from "./jwt.strategy";

function normalizeRoles(user: JwtPayload | undefined): string[] {
  if (!user) return [];
  const roles = user.roles ?? (user.role ? [user.role] : []);
  return roles.map((r) => String(r).toUpperCase());
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const required = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!required || required.length === 0) return true;

    const req = context.switchToHttp().getRequest<{ user?: JwtPayload }>();
    const userRoles = normalizeRoles(req.user);

    const ok = required.some((r) => userRoles.includes(String(r).toUpperCase()));
    if (!ok) throw new ForbiddenException("Insufficient role permissions.");
    return true;
  }
}
