"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthzModule = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const jwt_1 = require("@nestjs/jwt");
const app_config_module_1 = require("../config/app-config.module");
const app_config_service_1 = require("../config/app-config.service");
const jwt_strategy_1 = require("./jwt.strategy");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const roles_guard_1 = require("./guards/roles.guard");
const core_1 = require("@nestjs/core");
let AuthzModule = class AuthzModule {
};
exports.AuthzModule = AuthzModule;
exports.AuthzModule = AuthzModule = __decorate([
    (0, common_1.Module)({
        imports: [
            passport_1.PassportModule,
            app_config_module_1.AppConfigModule,
            jwt_1.JwtModule.registerAsync({
                imports: [app_config_module_1.AppConfigModule],
                inject: [app_config_service_1.AppConfigService],
                useFactory: (cfg) => ({
                    secret: cfg.jwtSecret(),
                    signOptions: {
                        issuer: cfg.jwtIssuer(),
                        audience: cfg.jwtAudience(),
                    },
                }),
            }),
        ],
        providers: [
            jwt_strategy_1.JwtStrategy,
            { provide: core_1.APP_GUARD, useClass: jwt_auth_guard_1.JwtAuthGuard },
            { provide: core_1.APP_GUARD, useClass: roles_guard_1.RolesGuard },
        ],
        exports: [jwt_1.JwtModule],
    })
], AuthzModule);
//# sourceMappingURL=authz.module.js.map