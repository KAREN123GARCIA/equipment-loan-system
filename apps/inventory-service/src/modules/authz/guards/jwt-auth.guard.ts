import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AppConfigService } from "../../config/app-config.service";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  constructor(private readonly cfg: AppConfigService) {
    super();
  }

  canActivate(context: ExecutionContext) {
    if (!this.cfg.authRequired()) return true;
    return super.canActivate(context);
  }
}
