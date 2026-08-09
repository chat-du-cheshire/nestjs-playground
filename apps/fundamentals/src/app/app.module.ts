import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CoffeesModule } from './coffees/coffees.module';
import { CommonModule } from './common/common.module';
import {
  createMongooseModuleOptions,
  mongoValidationSchema,
  readMongoEnvironment,
} from './mongo.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: mongoValidationSchema,
    }),
    CommonModule,
    CoffeesModule,
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        createMongooseModuleOptions(readMongoEnvironment(configService)),
    }),
  ],
})
export class AppModule {}
