import { Module } from '@nestjs/common';
import { RewardService } from './reward.service';

@Module({
  providers: [RewardService],
})
export class RewardModule {
  constructor() {
    console.log('RewardModule constructor');
  }
}
