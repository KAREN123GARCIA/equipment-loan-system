import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/modules/app.module';

describe('Templates (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.AUTH_REQUIRED = 'false';
    process.env.GLOBAL_PREFIX = 'api/v1';
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => { await app.close(); });

  it('CRUD template', async () => {
    const created = await request(app.getHttpServer())
      .post('/api/v1/templates')
      .send({ key:'LoanApproved.email', channel:'email', subject:'Approved {{equipmentName}}', body:'Hi {{userName}}', enabled:true })
      .expect(201);

    const id = created.body._id;

    await request(app.getHttpServer()).get('/api/v1/templates').expect(200);
    await request(app.getHttpServer()).patch(`/api/v1/templates/${id}`).send({ subject:'Updated subject' }).expect(200);
    await request(app.getHttpServer()).delete(`/api/v1/templates/${id}`).expect(200);
  });
});
