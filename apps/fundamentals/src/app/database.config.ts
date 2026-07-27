import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import Joi from '@hapi/joi';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

type DatabaseEnvKey =
  | 'DB_HOST'
  | 'DB_PORT'
  | 'DB_USERNAME'
  | 'DB_PASSWORD'
  | 'DB_DATABASE';

type DatabaseEnvironment = Record<DatabaseEnvKey, string | undefined>;

const databaseEnvKeys: DatabaseEnvKey[] = [
  'DB_HOST',
  'DB_PORT',
  'DB_USERNAME',
  'DB_PASSWORD',
  'DB_DATABASE',
];

export const databaseValidationSchema = Joi.object({
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().port().required(),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_DATABASE: Joi.string().required(),
}).unknown(true);

function getRequiredEnv(env: DatabaseEnvironment, key: DatabaseEnvKey): string {
  const value = env[key];

  if (!value) {
    throw new Error(`${key} is required`);
  }

  return value;
}

function getDatabasePort(env: DatabaseEnvironment): number {
  const port = Number(getRequiredEnv(env, 'DB_PORT'));

  if (!Number.isInteger(port)) {
    throw new Error('DB_PORT must be a number');
  }

  return port;
}

export function readDatabaseEnvironment(
  configService: ConfigService,
): DatabaseEnvironment {
  return databaseEnvKeys.reduce<DatabaseEnvironment>(
    (env, key) => ({
      ...env,
      [key]: configService.get<string>(key),
    }),
    {
      DB_HOST: undefined,
      DB_PORT: undefined,
      DB_USERNAME: undefined,
      DB_PASSWORD: undefined,
      DB_DATABASE: undefined,
    },
  );
}

export function createDatabaseOptions(
  env: DatabaseEnvironment,
): Pick<
  PostgresConnectionOptions,
  'type' | 'host' | 'port' | 'username' | 'password' | 'database'
> {
  return {
    type: 'postgres',
    host: getRequiredEnv(env, 'DB_HOST'),
    port: getDatabasePort(env),
    username: getRequiredEnv(env, 'DB_USERNAME'),
    password: getRequiredEnv(env, 'DB_PASSWORD'),
    database: getRequiredEnv(env, 'DB_DATABASE'),
  };
}

export function createTypeOrmModuleOptions(
  env: DatabaseEnvironment,
): TypeOrmModuleOptions {
  return {
    ...createDatabaseOptions(env),
    autoLoadEntities: true,
    synchronize: true,
  };
}
