import { Injectable } from '@nestjs/common';
import { AppConfigService } from '../config/app-config.service';
@Injectable()
export class AuthzConfigService { constructor(private readonly cfg:AppConfigService){} authRequired(){return this.cfg.authRequired();} }
