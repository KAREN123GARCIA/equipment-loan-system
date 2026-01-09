import { Test } from "@nestjs/testing";
import { HealthController } from "./health.controller";

describe("HealthController", () => {
  it("should return ok", async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    const ctrl = moduleRef.get(HealthController);
    expect(ctrl.ok()).toEqual({ status: "ok", service: "loan-service" });
  });
});
