import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/modules/app.module';

describe('Dev events ingest (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.AUTH_REQUIRED = 'false';
    process.env.ENABLE_DEV_EVENTS = 'true';
    process.env.DEV_EVENTS_TOKEN = 'test-token';
    process.env.GLOBAL_PREFIX = 'api/v1';

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => { await app.close(); });

  it('ingests event twice without duplicate error', async () => {
    const event = { eventId:'evt-e2e-1', type:'ReservationCreated', version:1, occurredAt:new Date().toISOString(), data:{ userId:'u1', userEmail:'u1@example.com', userName:'U1', equipmentName:'Laptop' } };
    await request(app.getHttpServer()).post('/api/v1/dev/events').set('x-dev-token','test-token').send(event).expect(201);
    await request(app.getHttpServer()).post('/api/v1/dev/events').set('x-dev-token','test-token').send(event).expect(201);
  });
});
