import { Module } from '@nestjs/common';
import { CoffeesService } from './coffees.service';
import { CoffeesController } from './coffees.controller';
import { CircuitBreakerInterceptor } from '../common/interceptors/circuit-breaker.interceptor';

@Module({
  controllers: [CoffeesController],
  providers: [CoffeesService, CircuitBreakerInterceptor],
})
export class CoffeesModule {}
