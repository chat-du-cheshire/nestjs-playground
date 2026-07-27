import {
  createDatabaseOptions,
  databaseValidationSchema,
} from './database.config';

describe('createDatabaseOptions', () => {
  it('maps database environment variables to TypeORM options', () => {
    const options = createDatabaseOptions({
      DB_HOST: 'db',
      DB_PORT: '5433',
      DB_USERNAME: 'alice',
      DB_PASSWORD: 'secret',
      DB_DATABASE: 'coffee',
    });

    expect(options).toMatchObject({
      type: 'postgres',
      host: 'db',
      port: 5433,
      username: 'alice',
      password: 'secret',
      database: 'coffee',
    });
  });

  it('throws when DB_PORT is not a number', () => {
    expect(() =>
      createDatabaseOptions({
        DB_HOST: 'db',
        DB_PORT: 'invalid',
        DB_USERNAME: 'alice',
        DB_PASSWORD: 'secret',
        DB_DATABASE: 'coffee',
      }),
    ).toThrow('DB_PORT must be a number');
  });
});

describe('databaseValidationSchema', () => {
  it('validates required database environment variables', () => {
    const result = databaseValidationSchema.validate({
      DB_HOST: 'db',
      DB_PORT: '5433',
      DB_USERNAME: 'alice',
      DB_PASSWORD: 'secret',
      DB_DATABASE: 'coffee',
      NODE_ENV: 'test',
    });

    expect(result.error).toBeUndefined();
    expect(result.value.DB_PORT).toBe(5433);
  });

  it('rejects missing required database environment variables', () => {
    const result = databaseValidationSchema.validate(
      {
        DB_HOST: 'db',
        DB_PORT: '5433',
      },
      { abortEarly: false },
    );

    expect(result.error?.details.map((detail) => detail.path.join('.'))).toEqual(
      expect.arrayContaining(['DB_USERNAME', 'DB_PASSWORD', 'DB_DATABASE']),
    );
  });
});
