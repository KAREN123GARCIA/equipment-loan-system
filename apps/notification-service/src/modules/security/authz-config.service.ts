import { Injectable } from '@nestjs/common';
@Injectable()
export class AuthzConfigService { authRequired(): boolean { return String(process.env.AUTH_REQUIRED || 'true') === 'true'; } }
