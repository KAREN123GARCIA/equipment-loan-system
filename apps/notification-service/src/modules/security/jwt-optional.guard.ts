import { ExecutionContext, Injectable, Inject } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthzConfigService } from './authz-config.service';

@Injectable()
export class JwtOptionalGuard extends AuthGuard('jwt') {
  constructor(@Inject(AuthzConfigService) private readonly authz: AuthzConfigService) { super(); }
  
  canActivate(context: ExecutionContext) {
    if (!this.authz?.authRequired()) return true;
    return super.canActivate(context) as any;
  }
}
