import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Reflector } from "@nestjs/core";
import { AuthzConfigService } from "./authz-config.service";
import { IS_PUBLIC_KEY } from "./public.decorator";

@Injectable()
export class JwtOptionalGuard extends AuthGuard("jwt") {
  constructor(
    private readonly authz: AuthzConfigService,
    private readonly reflector: Reflector,
  ) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    if (!this.authz.authRequired()) {
      return true;
    }

    return super.canActivate(context) as any;
  }

  handleRequest(err: any, user: any) {
    return user ?? null;
  }
}
