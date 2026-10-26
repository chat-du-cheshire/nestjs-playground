import { Injectable } from '@nestjs/common';
import { Policy } from './interfaces/policy.interface';
import { PolicyHandlerStorage } from './policy-handlers.storage';
import { ActiveUserData } from '../../interfaces/active-user-data.interface';

export class WhateverPolicy implements Policy {
  name = 'WhateverPolicy';
}

@Injectable()
export class WhateverPolicyHandler {
  constructor(private readonly storage: PolicyHandlerStorage) {
    this.storage.add(WhateverPolicy, this);
  }

  async handle(policy: WhateverPolicy, user: ActiveUserData): Promise<void> {
    const isCat = user.email.endsWith('@meow.com');

    if (!isCat) {
      throw new Error('User is not a cat');
    }
  }
}
