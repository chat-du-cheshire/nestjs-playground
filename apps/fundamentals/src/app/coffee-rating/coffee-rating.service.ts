import { Injectable } from '@nestjs/common';
import { Coffee } from '../coffees/entities/coffee.entity';
import { CoffeesService } from '../coffees/coffees.service';

@Injectable()
export class CoffeeRatingService {
  constructor(private readonly coffeesService: CoffeesService) {}

  findCoffeeToRate(coffeeId: number): Promise<Coffee> {
    return this.coffeesService.findOne(coffeeId);
  }
}
