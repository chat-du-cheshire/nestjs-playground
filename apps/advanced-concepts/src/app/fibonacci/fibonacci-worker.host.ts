import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { join } from 'node:path';
import { Piscina } from 'piscina';

@Injectable()
export class FibonacciWorkerHost implements OnModuleDestroy {
  private readonly pool = new Piscina({
    filename: join(__dirname, 'fibonacci.worker.js'),
  });

  run(n: number): Promise<number> {
    return this.pool.run(n);
  }

  onModuleDestroy(): Promise<void> {
    return this.pool.destroy();
  }
}
