import { Injectable } from '@nestjs/common';

@Injectable()
export class RewardService {
    meow() {
        console.log('RewardService meow');
    }
}
