import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Type,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { POLICIES_KEY } from '../decorators/policies.decorator';
import { Policy } from '../policies/interfaces/policy.interface';
import { ActiveUserData } from '../../interfaces/active-user-data.interface';
import { REQUEST_USER_KEY } from '../../iam.constants';
import { PolicyHandlerStorage } from '../policies/policy-handlers.storage';

@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly storage: PolicyHandlerStorage,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const policies = this.reflector.getAllAndOverride<Policy[]>(POLICIES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (policies) {
      const user: ActiveUserData = context.switchToHttp().getRequest()[
        REQUEST_USER_KEY
      ];

      await Promise.all(
        policies.map(async (policy) => {
          const handler = this.storage.get(policy.constructor as Type<Policy>);

          if (!handler) {
            throw new ForbiddenException(
              `No handler found for policy: ${policy.name}`,
            );
          }

          return handler.handle(policy, user);
        }),
      ).catch((error) => {
        throw new ForbiddenException(`Policy check failed: ${error.message}`);
      });
    }

    return true;
  }
}
