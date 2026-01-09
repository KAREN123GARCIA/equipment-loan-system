"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const health_controller_1 = require("./health.controller");
describe("HealthController", () => {
    it("should return ok", async () => {
        const moduleRef = await testing_1.Test.createTestingModule({
            controllers: [health_controller_1.HealthController],
        }).compile();
        const ctrl = moduleRef.get(health_controller_1.HealthController);
        expect(ctrl.ok()).toEqual({ status: "ok", service: "loan-service" });
    });
});
//# sourceMappingURL=health.controller.spec.js.map