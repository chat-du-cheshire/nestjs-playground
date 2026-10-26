import { Type } from '@nestjs/common';
import { Policy } from './interfaces/policy.interface';
import { PolicyHandler } from './interfaces/policy-handler.interface';

export class PolicyHandlerStorage {
  private readonly collection = new Map<Type<Policy>, PolicyHandler<any>>();

  add<T extends Policy>(policy: Type<T>, handler: PolicyHandler<T>): void {
    this.collection.set(policy, handler);
  }

  get<T extends Policy>(policy: Type<T>): PolicyHandler<T> | undefined {
    if (!this.collection.has(policy)) {
      throw new Error(`No handler found for policy: ${policy.name}`);
    }

    return this.collection.get(policy) as PolicyHandler<T> | undefined;
  }
}
