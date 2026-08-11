import { parentPort, workerData } from 'node:worker_threads';

function fibonacci(n: number): number {
  if (n < 2) {
    return n;
  }

  return fibonacci(n - 1) + fibonacci(n - 2);
}

const { n } = workerData as { n: number };

parentPort?.postMessage(fibonacci(n));
