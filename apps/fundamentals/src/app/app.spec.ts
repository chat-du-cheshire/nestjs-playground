import { resolve } from 'path';
import { config } from 'dotenv';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

config({ path: resolve(__dirname, '../../../../.env') });

import { AppModule } from './app.module';

describe('AppModule (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/coffees should return 200', async () => {
    await request(app.getHttpServer())
      .get('/api/coffees')
      .set('Authorization', process.env.API_KEY as string)
      .expect(200);
  });
});
