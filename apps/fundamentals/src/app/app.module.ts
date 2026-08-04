import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoffeesModule } from './coffees/coffees.module';
import { CommonModule } from './common/common.module';
import {
  createTypeOrmModuleOptions,
  databaseValidationSchema,
  readDatabaseEnvironment,
} from './database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: databaseValidationSchema,
    }),
    CommonModule,
    CoffeesModule,
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        createTypeOrmModuleOptions(readDatabaseEnvironment(configService)),
    }),
  ],
})
export class AppModule {}
