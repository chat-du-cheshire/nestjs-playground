import { Module } from '@nestjs/common';
import { ApplicationBootstrapOptions } from '../common/interfaces/application-bootstrap-options.interface';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({})
export class AppCoreModule {
  static forRoot(options: ApplicationBootstrapOptions) {
    const imports =
      options.driver === 'orm'
        ? [
            TypeOrmModule.forRoot({
              type: 'postgres',
              host: 'localhost',
              port: 5435,
              username: 'postgres',
              password: 'postgres',
              database: 'nestjs_db',
              autoLoadEntities: true,
              synchronize: true,
            }),
          ]
        : [];

    return { module: AppCoreModule, imports };
  }
}
