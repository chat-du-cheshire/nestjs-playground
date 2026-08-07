import { NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager, QueryRunner, Repository } from 'typeorm';
import { CoffeesService } from './coffees.service';
import { Coffee } from './entities/coffee.entity';
import { Flavor } from './entities/flavor.entity';
import { Event } from '../events/entities/event.entity';

describe('CoffeesService', () => {
  let service: CoffeesService;
  let coffeeRepository: jest.Mocked<Repository<Coffee>>;
  let flavorRepository: jest.Mocked<Repository<Flavor>>;
  let manager: jest.Mocked<EntityManager>;
  let queryRunner: jest.Mocked<QueryRunner>;

  beforeEach(() => {
    coffeeRepository = {
      create: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      preload: jest.fn(),
      remove: jest.fn(),
    } as unknown as jest.Mocked<Repository<Coffee>>;
    flavorRepository = {
      create: jest.fn(),
      findOneBy: jest.fn(),
    } as unknown as jest.Mocked<Repository<Flavor>>;
    manager = {
      save: jest.fn(),
    } as unknown as jest.Mocked<EntityManager>;
    queryRunner = {
      manager,
      connect: jest.fn().mockResolvedValue(undefined),
      startTransaction: jest.fn().mockResolvedValue(undefined),
      commitTransaction: jest.fn().mockResolvedValue(undefined),
      rollbackTransaction: jest.fn().mockResolvedValue(undefined),
      release: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<QueryRunner>;
    const dataSource = {
      createQueryRunner: jest.fn().mockReturnValue(queryRunner),
    } as unknown as jest.Mocked<DataSource>;

    service = new CoffeesService(
      coffeeRepository,
      flavorRepository,
      dataSource,
    );
  });

  describe('findAll', () => {
    it('loads coffees with flavors and applies pagination', async () => {
      const coffees = [{ id: 1, title: 'Latte' }] as Coffee[];
      coffeeRepository.find.mockResolvedValue(coffees);

      await expect(service.findAll({ limit: 10, offset: 20 })).resolves.toBe(
        coffees,
      );
      expect(coffeeRepository.find).toHaveBeenCalledWith({
        relations: ['flavors'],
        take: 10,
        skip: 20,
      });
    });
  });

  describe('findOne', () => {
    it('returns a coffee with its flavors', async () => {
      const coffee = { id: 1, title: 'Latte' } as Coffee;
      coffeeRepository.findOne.mockResolvedValue(coffee);

      await expect(service.findOne(1)).resolves.toBe(coffee);
      expect(coffeeRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['flavors'],
      });
    });

    it('throws when the coffee does not exist', async () => {
      coffeeRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(404)).rejects.toThrow(
        new NotFoundException('Coffee with id: 404 not found'),
      );
    });
  });

  describe('create', () => {
    it('reuses existing flavors, creates missing flavors, and commits', async () => {
      const vanilla = { id: 1, name: 'vanilla' } as Flavor;
      const caramel = { name: 'caramel' } as Flavor;
      const coffee = { title: 'Latte', brand: 'Acme' } as Coffee;
      const savedCoffee = { ...coffee, id: 1 } as Coffee;
      flavorRepository.findOneBy
        .mockResolvedValueOnce(vanilla)
        .mockResolvedValueOnce(null);
      flavorRepository.create.mockReturnValue(caramel);
      coffeeRepository.create.mockReturnValue(coffee);
      manager.save.mockResolvedValue(savedCoffee);

      await expect(
        service.create({
          title: 'Latte',
          brand: 'Acme',
          flavors: ['vanilla', 'caramel'],
        }),
      ).resolves.toBe(savedCoffee);

      expect(flavorRepository.create).toHaveBeenCalledWith({ name: 'caramel' });
      expect(coffeeRepository.create).toHaveBeenCalledWith({
        title: 'Latte',
        brand: 'Acme',
        flavors: [vanilla, caramel],
      });
      expect(manager.save).toHaveBeenCalledWith(coffee);
      expect(queryRunner.commitTransaction).toHaveBeenCalledTimes(1);
      expect(queryRunner.rollbackTransaction).not.toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalledTimes(1);
    });

    it('rolls back, releases, and rethrows when saving fails', async () => {
      const error = new Error('save failed');
      flavorRepository.findOneBy.mockResolvedValue(null);
      flavorRepository.create.mockReturnValue({ name: 'vanilla' } as Flavor);
      coffeeRepository.create.mockReturnValue({ title: 'Latte' } as Coffee);
      manager.save.mockRejectedValue(error);

      await expect(
        service.create({
          title: 'Latte',
          brand: 'Acme',
          flavors: ['vanilla'],
        }),
      ).rejects.toBe(error);

      expect(queryRunner.commitTransaction).not.toHaveBeenCalled();
      expect(queryRunner.rollbackTransaction).toHaveBeenCalledTimes(1);
      expect(queryRunner.release).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    it('preloads flavor entities and commits the updated coffee', async () => {
      const vanilla = { id: 1, name: 'vanilla' } as Flavor;
      const coffee = { id: 1, title: 'Updated', flavors: [vanilla] } as Coffee;
      flavorRepository.findOneBy.mockResolvedValue(vanilla);
      coffeeRepository.preload.mockResolvedValue(coffee);
      manager.save.mockResolvedValue(coffee);

      await expect(
        service.update(1, { title: 'Updated', flavors: ['vanilla'] }),
      ).resolves.toBe(coffee);
      expect(coffeeRepository.preload).toHaveBeenCalledWith({
        id: 1,
        title: 'Updated',
        flavors: [vanilla],
      });
      expect(queryRunner.commitTransaction).toHaveBeenCalledTimes(1);
      expect(queryRunner.release).toHaveBeenCalledTimes(1);
    });

    it('throws when the coffee does not exist', async () => {
      coffeeRepository.preload.mockResolvedValue(undefined);

      await expect(service.update(404, { title: 'Missing' })).rejects.toThrow(
        new NotFoundException('Coffee with id: 404 not found'),
      );
      expect(queryRunner.connect).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('finds and removes the coffee', async () => {
      const coffee = { id: 1, title: 'Latte' } as Coffee;
      coffeeRepository.findOne.mockResolvedValue(coffee);
      coffeeRepository.remove.mockResolvedValue(coffee);

      await expect(service.remove(1)).resolves.toBe(coffee);
      expect(coffeeRepository.remove).toHaveBeenCalledWith(coffee);
    });
  });

  describe('recommendCoffee', () => {
    it('increments recommendations and saves the coffee and event atomically', async () => {
      const coffee = { id: 1, title: 'Latte', recommendations: 2 } as Coffee;
      const savedCoffee = { ...coffee, recommendations: 3 } as Coffee;
      coffeeRepository.findOne.mockResolvedValue(coffee);
      manager.save.mockResolvedValueOnce(savedCoffee).mockResolvedValueOnce({});

      await expect(service.recommendCoffee(1)).resolves.toBe(savedCoffee);

      expect(coffee.recommendations).toBe(3);
      expect(manager.save).toHaveBeenNthCalledWith(1, coffee);
      expect(manager.save).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining<Event>({
          type: 'coffee',
          name: 'recommend_coffee',
          payload: { coffeeId: 1 },
        }),
      );
      expect(queryRunner.commitTransaction).toHaveBeenCalledTimes(1);
      expect(queryRunner.release).toHaveBeenCalledTimes(1);
    });
  });
});
