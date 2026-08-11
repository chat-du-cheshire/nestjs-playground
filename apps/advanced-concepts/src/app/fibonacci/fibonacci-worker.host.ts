import { Injectable } from '@nestjs/common';
import { Worker } from 'node:worker_threads';
import { join } from 'node:path';

@Injectable()
export class FibonacciWorkerHost {
  run(n: number): Promise<number> {
    return new Promise((resolve, reject) => {
      const worker = new Worker(join(__dirname, 'fibonacci.worker.js'), {
        workerData: { n },
      });

      worker.once('message', (result: number) => {
        resolve(result);
        worker.terminate();
      });

      worker.once('error', reject);
    });
  }
}
