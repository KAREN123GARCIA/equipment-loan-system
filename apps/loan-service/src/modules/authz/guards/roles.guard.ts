import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../roles.decorator";
import { AppConfigService } from "../../config/app-config.service";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private readonly cfg: AppConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    if (!this.cfg.authRequired()) return true;

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) return true;

    const req = context.switchToHttp().getRequest();
    const user = req.user as { roles?: string[] } | undefined;
    const userRoles = user?.roles ?? [];

    return requiredRoles.some((r) => userRoles.includes(r));
  }
}
