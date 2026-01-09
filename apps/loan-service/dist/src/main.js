"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./modules/app.module");
const app_config_service_1 = require("./modules/config/app-config.service");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { bufferLogs: true });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    const cfg = app.get(app_config_service_1.AppConfigService);
    const origins = cfg.corsOrigins();
    if (origins.includes("*")) {
        app.enableCors({ origin: true, credentials: true });
    }
    else {
        app.enableCors({ origin: origins, credentials: true });
    }
    app.setGlobalPrefix(cfg.globalPrefix());
    const port = cfg.port();
    await app.listen(port);
    console.log(`[loan-service] Listening on http://localhost:${port}/${cfg.globalPrefix()}`);
}
bootstrap();
//# sourceMappingURL=main.js.map