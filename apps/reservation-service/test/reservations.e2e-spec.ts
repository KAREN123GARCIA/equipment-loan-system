import { Test } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../src/modules/app.module";

describe("Reservations (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.AUTH_REQUIRED = "false";
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => { await app.close(); });

  it("GET /api/v1/health", async () => {
    await request(app.getHttpServer()).get("/api/v1/health").expect(200);
  });

  it("POST /api/v1/reservations rejects invalid window", async () => {
    await request(app.getHttpServer())
      .post("/api/v1/reservations")
      .send({ equipmentId:"eq", startAt:"2026-01-10T12:00:00Z", endAt:"2026-01-10T10:00:00Z" })
      .expect(400);
  });

  it("GET /metrics", async () => {
    const res = await request(app.getHttpServer()).get("/metrics").expect(200);
    expect(res.text).toContain("reservation_create_total");
  });
});
