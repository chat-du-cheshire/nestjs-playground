import 'dotenv/config';

import { DataSource } from 'typeorm';
import { createDatabaseOptions } from './apps/fundamentals/src/app/database.config';

export default new DataSource({
  ...createDatabaseOptions(process.env),
  entities: ['apps/fundamentals/src/app/**/*.entity.ts'],
  migrations: ['apps/fundamentals/src/migrations/*.ts'],
});
