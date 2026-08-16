import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoffeesModule } from './coffees/coffees.module';
import { SchedulerModule } from './scheduler/scheduler.module';
// import { CronModule } from './cron/cron.module';
import { FibonacciModule } from './fibonacci/fibonacci.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PaymentsModule } from './payments/payments.module';
import { DataSourceModule } from './data-source/data-source.module';
import { UsersModule } from './users/users.module';
import { ContextIdFactory } from '@nestjs/core';
import { AggregateByContextIdStrategy } from './core/aggregate-by-tenant-and-locale.strategy';
import { I18nModule } from './i18n/i18n.module';

ContextIdFactory.apply(new AggregateByContextIdStrategy());

@Module({
  imports: [
    CoffeesModule,
    SchedulerModule,
    /* CronModule, */
    FibonacciModule,
    EventEmitterModule.forRoot(),
    PaymentsModule,
    DataSourceModule,
    UsersModule,
    I18nModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
