"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
const app_module_1 = require("./modules/app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const config = app.get(config_1.ConfigService);
    const globalPrefix = config.get('GLOBAL_PREFIX') || 'api/v1';
    app.setGlobalPrefix(globalPrefix);
    const authRequired = config.get('AUTH_REQUIRED') === 'true';
    if (!authRequired) {
        app.use((req, _res, next) => {
            const userId = req.headers['x-user-id'];
            if (userId) {
                req.user = { sub: userId, roles: ['ADMIN'] };
            }
            next();
        });
    }
    await app.listen(Number(config.get('PORT') || 3004));
}
bootstrap();
//# sourceMappingURL=main.js.map