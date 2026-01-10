import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AuthzConfigService } from "./authz-config.service";

@Injectable()
export class JwtOptionalGuard extends AuthGuard("jwt") {
  constructor(private readonly authz: AuthzConfigService) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // auth apagado => no valida JWT (tu modo dev)
    if (!this.authz.authRequired()) return true;

    const req = context.switchToHttp().getRequest();
    const authHeader: string | undefined = req.headers?.authorization;

    // auth encendido, pero sin Bearer => público (no rompe)
    if (!authHeader || !authHeader.startsWith("Bearer ")) return true;

    // si hay Bearer => validar JWT normal
    return super.canActivate(context) as any;
  }

  // Si viene token inválido, que falle (401). Si no vino token, user será null.
  handleRequest(err: any, user: any) {
    if (err) throw err;
    return user ?? null;
  }
}
