import { Injectable, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';
import { INTRAVAL_KEY } from './decorators/interval.decorator';
import { INTRAVAL_HOST_KEY } from './decorators/interval-host.decorator';

@Injectable()
export class IntervalScheduler implements OnApplicationBootstrap, OnApplicationShutdown {
  private intervals: NodeJS.Timeout[] = [];
  
  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly reflector: Reflector,
    private readonly metaDataScanner: MetadataScanner
  ) {}

  onApplicationBootstrap() {
    const providers = this.discoveryService.getProviders();

    providers.forEach((wrapper) => {
      const { instance } = wrapper;

      const prototype = instance && Object.getPrototypeOf(instance);

      if (!prototype ) {
        return;
      }

      const isIntervalHost = this.reflector.get<boolean>(INTRAVAL_HOST_KEY, instance?.constructor)??false;

      if (!isIntervalHost) {
        return;
      }

      const methodNames = this.metaDataScanner.getAllMethodNames(prototype);

      methodNames.forEach((methodName) => {
        const methodRef = prototype[methodName];
        const interval = this.reflector.get(INTRAVAL_KEY, methodRef);

        if (interval === undefined) {
          return;
        }

        this.intervals.push(setInterval(() => {
          methodRef.call(instance);
        }, interval));
      }
    )
  })
  }
  
  onApplicationShutdown(signal?: string) {
    this.intervals.forEach((interval) => clearInterval(interval));
  }
}