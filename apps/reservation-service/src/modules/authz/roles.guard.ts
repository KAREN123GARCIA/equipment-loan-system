import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "./roles.decorator";
import { AuthzConfigService } from "./authz-config.service";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private readonly authz: AuthzConfigService) {}

  canActivate(ctx: ExecutionContext): boolean {
    if (!this.authz.authRequired()) return true;
    const required = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [ctx.getHandler(), ctx.getClass()]);
    if (!required?.length) return true;
    const req = ctx.switchToHttp().getRequest<any>();
    const roles: string[] = req.user?.roles ?? [];
    if (!required.some(r=>roles.includes(r))) throw new ForbiddenException("Insufficient role.");
    return true;
  }
}
