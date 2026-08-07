import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import request from 'supertest';
import { CoffeesModule } from './coffees.module';

describe('CoffeesModule (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    // Connect straight to the dedicated test DB (docker-compose
    // `postgres_test`, port 5433) instead of going through AppModule's
    // ConfigService-driven connection, since this suite will create/mutate
    // real rows and ConfigModule reads process.env synchronously at import
    // time (too early to override from inside a test).
    // NOTE: this drops the global ApiKeyGuard (only registered via
    // AppModule/CommonModule) — revisit if these tests need to assert on it.
    const moduleRef = await Test.createTestingModule({
      imports: [
        CoffeesModule,
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: 'localhost',
          port: 5433,
          username: 'postgres',
          password: 'postgres',
          database: 'nestjs_db',
          autoLoadEntities: true,
          synchronize: true,
        }),
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    // Mirrors main.ts, since createNestApplication() doesn't inherit it.
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  async function createCoffee(overrides: Partial<{
    title: string;
    brand: string;
    flavors: string[];
  }> = {}) {
    const res = await request(app.getHttpServer())
      .post('/api/coffees')
      .send({
        title: 'Latte',
        brand: 'Acme',
        flavors: ['vanilla'],
        ...overrides,
      })
      .expect(201);

    return res.body as { id: number; title: string; brand: string };
  }

  async function deleteCoffee(id: number) {
    await request(app.getHttpServer()).delete(`/api/coffees/${id}`);
  }

  describe('GET /coffees', () => {
    it('returns a paginated list of coffees', async () => {
      const coffee = await createCoffee();

      const res = await request(app.getHttpServer())
        .get('/api/coffees')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: coffee.id })]),
      );

      await deleteCoffee(coffee.id);
    });
  });

  describe('GET /coffees/:id', () => {
    it('returns a single coffee by id', async () => {
      const coffee = await createCoffee({ title: 'Espresso' });

      const res = await request(app.getHttpServer())
        .get(`/api/coffees/${coffee.id}`)
        .expect(200);

      expect(res.body).toMatchObject({
        id: coffee.id,
        title: 'Espresso',
        brand: 'Acme',
      });

      await deleteCoffee(coffee.id);
    });

    it('returns 404 when the coffee does not exist', async () => {
      await request(app.getHttpServer())
        .get('/api/coffees/999999999')
        .expect(404);
    });
  });

  describe('POST /coffees', () => {
    it('creates a new coffee', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/coffees')
        .send({ title: 'Mocha', brand: 'Acme', flavors: ['chocolate'] })
        .expect(201);

      expect(res.body).toMatchObject({
        title: 'Mocha',
        brand: 'Acme',
        recommendations: 0,
      });
      expect(res.body.flavors).toEqual([
        expect.objectContaining({ name: 'chocolate' }),
      ]);

      await deleteCoffee(res.body.id);
    });

    it('rejects an invalid payload', async () => {
      await request(app.getHttpServer())
        .post('/api/coffees')
        .send({ title: 'Missing brand and flavors' })
        .expect(400);
    });
  });

  describe('PUT /coffees/:id', () => {
    it('updates an existing coffee', async () => {
      const coffee = await createCoffee({ title: 'Americano' });

      const res = await request(app.getHttpServer())
        .put(`/api/coffees/${coffee.id}`)
        .send({ title: 'Americano Updated' })
        .expect(200);

      expect(res.body).toMatchObject({
        id: coffee.id,
        title: 'Americano Updated',
      });

      await deleteCoffee(coffee.id);
    });

    it('returns 404 when the coffee does not exist', async () => {
      await request(app.getHttpServer())
        .put('/api/coffees/999999999')
        .send({ title: 'Does not matter' })
        .expect(404);
    });
  });

  describe('POST /coffees/:id/recommend', () => {
    it('increments the recommendation count', async () => {
      const coffee = await createCoffee({ title: 'Cortado' });

      const res = await request(app.getHttpServer())
        .post(`/api/coffees/${coffee.id}/recommend`)
        .expect(201);

      expect(res.body.recommendations).toBe(1);

      await deleteCoffee(coffee.id);
    });
  });

  describe('DELETE /coffees/:id', () => {
    it('removes an existing coffee', async () => {
      const coffee = await createCoffee({ title: 'Flat White' });

      await request(app.getHttpServer())
        .delete(`/api/coffees/${coffee.id}`)
        .expect(200);

      await request(app.getHttpServer())
        .get(`/api/coffees/${coffee.id}`)
        .expect(404);
    });
  });
});
