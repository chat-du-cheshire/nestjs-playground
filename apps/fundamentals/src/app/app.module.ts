import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoffeesModule } from './coffees/coffees.module';
import { CommonModule } from './common/common.module';
import {
  createTypeOrmModuleOptions,
  databaseValidationSchema,
  readDatabaseEnvironment,
} from './database.config';
import {
  createMongooseModuleOptions,
  mongoValidationSchema,
  readMongoEnvironment,
} from './mongo.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: databaseValidationSchema.concat(
        mongoValidationSchema,
      ),
    }),
    CommonModule,
    CoffeesModule,
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        createTypeOrmModuleOptions(readDatabaseEnvironment(configService)),
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        createMongooseModuleOptions(readMongoEnvironment(configService)),
    }),
  ],
})
export class AppModule {}
