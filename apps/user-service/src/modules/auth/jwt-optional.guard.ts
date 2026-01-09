import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AuthzConfigService } from "./authz-config.service";

@Injectable()
export class JwtOptionalGuard extends AuthGuard("jwt") {
  constructor(private readonly authz: AuthzConfigService) {
    super();
  }

  canActivate(context: ExecutionContext) {
    if (!this.authz.authRequired()) {
      return true; // auth apagado => no valida JWT
    }
    return super.canActivate(context) as any;
  }
}
