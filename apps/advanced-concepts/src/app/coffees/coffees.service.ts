import { Injectable } from '@nestjs/common';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';
import { LazyModuleLoader } from '@nestjs/core';

@Injectable()
export class CoffeesService {
  constructor(private readonly lazyModuleLoader: LazyModuleLoader) {}

  create(createCoffeeDto: CreateCoffeeDto) {
  
    return 'This action adds a new coffee';
  }

  async findAll() {
    const rewardModuleRef = await this.lazyModuleLoader.load(() => import('../reward/reward.module.ts').then((m) => m.RewardModule));
    const {RewardService} = await import('../reward/reward.service.ts');
    const rewardService = rewardModuleRef.get(RewardService);
    rewardService.meow();
  
    return `This action returns all coffees`;
  }

  findOne(id: number) {
    return `This action returns a #${id} coffee`;
  }

  update(id: number, updateCoffeeDto: UpdateCoffeeDto) {
    return `This action updates a #${id} coffee`;
  }

  remove(id: number) {
    return `This action removes a #${id} coffee`;
  }
}
