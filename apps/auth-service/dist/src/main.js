"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const config_1 = require("@nestjs/config");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const cfg = app.get(config_1.ConfigService);
    const prefix = cfg.get("GLOBAL_PREFIX", "api/v1");
    app.setGlobalPrefix(prefix);
    // CORS simple en dev (si quieres)
    const corsOrigins = cfg.get("CORS_ORIGINS", "*");
    app.enableCors({
        origin: corsOrigins === "*" ? true : corsOrigins.split(",").map(s => s.trim()),
        credentials: true,
        exposedHeaders: ["X-Correlation-Id"],
    });
    const port = Number(cfg.get("PORT", 3002));
    await app.listen(port);
    console.log(`[auth-service] Listening on http://localhost:${port}/${prefix}`);
}
bootstrap();
//# sourceMappingURL=main.js.map