import { Test } from '@nestjs/testing';
import { AppService } from './app.service';
import { I18nService } from './i18n/i18n.service';

describe('AppService', () => {
  let service: AppService;

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: [
        AppService,
        { provide: I18nService, useValue: { translate: () => 'Hello' } },
      ],
    }).compile();

    service = app.get<AppService>(AppService);
  });

  describe('getData', () => {
    it('should return "Hello"', () => {
      expect(service.getData()).toEqual({ message: 'Hello' });
    });
  });
});
