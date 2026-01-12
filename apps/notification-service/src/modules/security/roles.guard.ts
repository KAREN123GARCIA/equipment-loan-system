import { CanActivate, ExecutionContext, Injectable, ForbiddenException, Inject } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { AuthzConfigService } from './authz-config.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(AuthzConfigService) private readonly authz: AuthzConfigService,
  ) {}

  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [ctx.getHandler(), ctx.getClass()]);
    if (!required || required.length === 0) return true;

    // Si AUTH_REQUIRED es false, permitir acceso sin validar roles
    if (!this.authz?.authRequired()) return true;

    const req = ctx.switchToHttp().getRequest();
    const roles: string[] = req.user?.roles || [];
    const ok = required.some((r) => roles.includes(r));
    if (!ok) throw new ForbiddenException('Insufficient role.');
    return true;
  }
}
