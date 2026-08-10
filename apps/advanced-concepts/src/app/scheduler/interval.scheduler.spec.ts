import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';
import { IntervalScheduler } from './interval.scheduler';

describe('IntervalScheduler', () => {
  it('should be defined', () => {
    expect(
      new IntervalScheduler(
        {} as DiscoveryService,
        {} as Reflector,
        {} as MetadataScanner,
      ),
    ).toBeDefined();
  });
});
