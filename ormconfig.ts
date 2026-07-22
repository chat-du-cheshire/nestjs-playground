import { DataSource } from 'typeorm';

export default new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'nestjs_db',
  entities: ['apps/fundamentals/src/app/**/*.entity.ts'],
  migrations: ['apps/fundamentals/src/migrations/*.ts'],
});
