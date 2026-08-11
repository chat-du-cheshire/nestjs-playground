import { Test, TestingModule } from '@nestjs/testing';
import { FibonacciController } from './fibonacci.controller';
import { FibonacciWorkerHost } from './fibonacci-worker.host';

describe('FibonacciController', () => {
  let controller: FibonacciController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FibonacciController],
      providers: [
        {
          provide: FibonacciWorkerHost,
          useValue: { run: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<FibonacciController>(FibonacciController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
