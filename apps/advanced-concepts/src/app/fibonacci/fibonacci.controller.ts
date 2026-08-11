import { Controller, Get, Param } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { FibonacciWorkerHost } from './fibonacci-worker.host';

@Controller('fibonacci')
export class FibonacciController {
  constructor(private readonly fibonacciWorkerHost: FibonacciWorkerHost) {}

  @Get(':n')
  async findOne(@Param('n') n: string) {
    const startedAt = performance.now();
    const result = await this.fibonacciWorkerHost.run(+n);
    const durationMs = performance.now() - startedAt;

    return {
      id: randomUUID(),
      result,
      durationMs,
    };
  }
}
