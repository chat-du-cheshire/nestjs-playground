import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoffeesModule } from './coffees.module';

describe('CoffeesModule (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    // Connect straight to the dedicated test DB (docker-compose
    // `postgres_test`, port 5433) instead of going through AppModule's
    // ConfigService-driven connection, since this suite will create/mutate
    // real rows and ConfigModule reads process.env synchronously at import
    // time (too early to override from inside a test).
    // TODO: this drops the global ApiKeyGuard (only registered via
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
    await app.init();
  });

  afterAll(async () => {
    // TODO: clean up any test data created against the DB
    await app.close();
  });

  describe('GET /coffees', () => {
    it.todo('returns a paginated list of coffees');
  });

  describe('GET /coffees/:id', () => {
    it.todo('returns a single coffee by id');
    it.todo('returns 404 when the coffee does not exist');
  });

  describe('POST /coffees', () => {
    it.todo('creates a new coffee');
    it.todo('rejects an invalid payload');
  });

  describe('PUT /coffees/:id', () => {
    it.todo('updates an existing coffee');
    it.todo('returns 404 when the coffee does not exist');
  });

  describe('POST /coffees/:id/recommend', () => {
    it.todo('increments the recommendation count');
  });

  describe('DELETE /coffees/:id', () => {
    it.todo('removes an existing coffee');
  });
});
