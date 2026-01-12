"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoansModule = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const loans_controller_1 = require("./loans.controller");
const loans_service_1 = require("./loans.service");
const app_config_module_1 = require("../config/app-config.module");
const app_config_service_1 = require("../config/app-config.service");
let LoansModule = class LoansModule {
};
exports.LoansModule = LoansModule;
exports.LoansModule = LoansModule = __decorate([
    (0, common_1.Module)({
        imports: [
            app_config_module_1.AppConfigModule,
            axios_1.HttpModule.registerAsync({
                imports: [app_config_module_1.AppConfigModule],
                inject: [app_config_service_1.AppConfigService],
                useFactory: (cfg) => ({
                    timeout: cfg.httpTimeoutMs(),
                    maxRedirects: 0,
                }),
            }),
        ],
        controllers: [loans_controller_1.LoansController],
        providers: [loans_service_1.LoansService],
    })
], LoansModule);
//# sourceMappingURL=loans.module.js.map