import { ConfigService } from '@nestjs/config';
import { MongooseModuleOptions } from '@nestjs/mongoose';
import Joi from '@hapi/joi';

type MongoEnvKey =
  | 'MONGO_HOST'
  | 'MONGO_PORT'
  | 'MONGO_USERNAME'
  | 'MONGO_PASSWORD'
  | 'MONGO_DATABASE';

type MongoEnvironment = Record<MongoEnvKey, string | undefined>;

const mongoEnvKeys: MongoEnvKey[] = [
  'MONGO_HOST',
  'MONGO_PORT',
  'MONGO_USERNAME',
  'MONGO_PASSWORD',
  'MONGO_DATABASE',
];

export const mongoValidationSchema = Joi.object({
  MONGO_HOST: Joi.string().required(),
  MONGO_PORT: Joi.number().port().required(),
  MONGO_USERNAME: Joi.string().required(),
  MONGO_PASSWORD: Joi.string().required(),
  MONGO_DATABASE: Joi.string().required(),
}).unknown(true);

function getRequiredEnv(env: MongoEnvironment, key: MongoEnvKey): string {
  const value = env[key];

  if (!value) {
    throw new Error(`${key} is required`);
  }

  return value;
}

export function readMongoEnvironment(
  configService: ConfigService,
): MongoEnvironment {
  return mongoEnvKeys.reduce<MongoEnvironment>(
    (env, key) => ({
      ...env,
      [key]: configService.get<string>(key),
    }),
    {
      MONGO_HOST: undefined,
      MONGO_PORT: undefined,
      MONGO_USERNAME: undefined,
      MONGO_PASSWORD: undefined,
      MONGO_DATABASE: undefined,
    },
  );
}

export function createMongooseModuleOptions(
  env: MongoEnvironment,
): MongooseModuleOptions & { uri: string } {
  const host = getRequiredEnv(env, 'MONGO_HOST');
  const port = getRequiredEnv(env, 'MONGO_PORT');
  const username = getRequiredEnv(env, 'MONGO_USERNAME');
  const password = getRequiredEnv(env, 'MONGO_PASSWORD');
  const database = getRequiredEnv(env, 'MONGO_DATABASE');

  return {
    uri: `mongodb://${username}:${password}@${host}:${port}/${database}?authSource=admin`,
  };
}
