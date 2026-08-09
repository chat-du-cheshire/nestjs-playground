import { NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { CoffeesService } from './coffees.service';

function createQueryMock<T>(resolvedValue: T) {
  const query: Record<string, jest.Mock> & {
    then: Promise<T>['then'];
  } = {} as never;

  query.populate = jest.fn().mockReturnValue(query);
  query.skip = jest.fn().mockReturnValue(query);
  query.limit = jest.fn().mockReturnValue(query);
  query.session = jest.fn().mockReturnValue(query);
  query.exec = jest.fn().mockResolvedValue(resolvedValue);
  query.then = ((resolve, reject) =>
    Promise.resolve(resolvedValue).then(resolve, reject)) as Promise<T>['then'];

  return query;
}

describe('CoffeesService', () => {
  let service: CoffeesService;
  let coffeeModel: {
    find: jest.Mock;
    findById: jest.Mock;
    findByIdAndUpdate: jest.Mock;
    create: jest.Mock;
  };
  let flavorModel: { findOne: jest.Mock; create: jest.Mock };
  let eventModel: { create: jest.Mock };
  let session: {
    withTransaction: jest.Mock;
    endSession: jest.Mock;
  };
  let connection: { startSession: jest.Mock };

  const objectId = () => new Types.ObjectId().toHexString();

  beforeEach(() => {
    coffeeModel = {
      find: jest.fn(),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      create: jest.fn(),
    };
    flavorModel = {
      findOne: jest.fn(),
      create: jest.fn(),
    };
    eventModel = {
      create: jest.fn(),
    };
    session = {
      withTransaction: jest.fn().mockImplementation(async (work) => work()),
      endSession: jest.fn().mockResolvedValue(undefined),
    };
    connection = {
      startSession: jest.fn().mockResolvedValue(session),
    };

    service = new CoffeesService(
      coffeeModel as never,
      flavorModel as never,
      eventModel as never,
      connection as never,
    );
  });

  describe('findAll', () => {
    it('loads coffees with flavors and applies pagination', async () => {
      const coffees = [{ title: 'Latte' }];
      const query = createQueryMock(coffees);
      coffeeModel.find.mockReturnValue(query);

      await expect(service.findAll({ limit: 10, offset: 20 })).resolves.toBe(
        coffees,
      );
      expect(query.populate).toHaveBeenCalledWith('flavors');
      expect(query.skip).toHaveBeenCalledWith(20);
      expect(query.limit).toHaveBeenCalledWith(10);
    });
  });

  describe('findOne', () => {
    it('returns a coffee with its flavors', async () => {
      const id = objectId();
      const coffee = { id, title: 'Latte' };
      const query = createQueryMock(coffee);
      coffeeModel.findById.mockReturnValue(query);

      await expect(service.findOne(id)).resolves.toBe(coffee);
      expect(coffeeModel.findById).toHaveBeenCalledWith(id);
      expect(query.populate).toHaveBeenCalledWith('flavors');
    });

    it('throws when the coffee does not exist', async () => {
      const id = objectId();
      coffeeModel.findById.mockReturnValue(createQueryMock(null));

      await expect(service.findOne(id)).rejects.toThrow(
        new NotFoundException(`Coffee with id: ${id} not found`),
      );
    });

    it('throws when the id is not a valid ObjectId', async () => {
      await expect(service.findOne('not-an-id')).rejects.toThrow(
        NotFoundException,
      );
      expect(coffeeModel.findById).not.toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('reuses existing flavors, creates missing flavors, and commits', async () => {
      const vanilla = { _id: objectId(), name: 'vanilla' };
      const caramel = { _id: objectId(), name: 'caramel' };
      const coffee = {
        title: 'Latte',
        brand: 'Acme',
        populate: jest.fn().mockResolvedValue(undefined),
      };
      flavorModel.findOne
        .mockReturnValueOnce(createQueryMock(vanilla))
        .mockReturnValueOnce(createQueryMock(null));
      flavorModel.create.mockResolvedValue([caramel]);
      coffeeModel.create.mockResolvedValue([coffee]);

      await expect(
        service.create({
          title: 'Latte',
          brand: 'Acme',
          flavors: ['vanilla', 'caramel'],
        }),
      ).resolves.toBe(coffee);

      expect(flavorModel.create).toHaveBeenCalledWith(
        [{ name: 'caramel' }],
        { session },
      );
      expect(coffeeModel.create).toHaveBeenCalledWith(
        [
          {
            title: 'Latte',
            brand: 'Acme',
            flavors: [vanilla._id, caramel._id],
          },
        ],
        { session },
      );
      expect(coffee.populate).toHaveBeenCalledWith('flavors');
      expect(session.endSession).toHaveBeenCalledTimes(1);
    });

    it('propagates errors and still ends the session', async () => {
      const error = new Error('save failed');
      flavorModel.findOne.mockReturnValue(createQueryMock(null));
      flavorModel.create.mockResolvedValue([{ _id: objectId(), name: 'vanilla' }]);
      coffeeModel.create.mockRejectedValue(error);

      await expect(
        service.create({
          title: 'Latte',
          brand: 'Acme',
          flavors: ['vanilla'],
        }),
      ).rejects.toBe(error);

      expect(session.endSession).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    it('preloads flavor documents and commits the updated coffee', async () => {
      const id = objectId();
      const vanilla = { _id: objectId(), name: 'vanilla' };
      const coffee = { id, title: 'Updated', flavors: [vanilla] };
      flavorModel.findOne.mockReturnValue(createQueryMock(vanilla));
      coffeeModel.findByIdAndUpdate.mockReturnValue(createQueryMock(coffee));

      await expect(
        service.update(id, { title: 'Updated', flavors: ['vanilla'] }),
      ).resolves.toBe(coffee);
      expect(coffeeModel.findByIdAndUpdate).toHaveBeenCalledWith(
        id,
        { title: 'Updated', flavors: [vanilla._id] },
        { returnDocument: 'after', session },
      );
    });

    it('throws when the coffee does not exist', async () => {
      const id = objectId();
      coffeeModel.findByIdAndUpdate.mockReturnValue(createQueryMock(null));

      await expect(
        service.update(id, { title: 'Missing' }),
      ).rejects.toThrow(new NotFoundException(`Coffee with id: ${id} not found`));
    });
  });

  describe('remove', () => {
    it('finds and removes the coffee', async () => {
      const id = objectId();
      const coffee = {
        id,
        title: 'Latte',
        deleteOne: jest.fn().mockResolvedValue(undefined),
      };
      coffeeModel.findById.mockReturnValue(createQueryMock(coffee));

      await expect(service.remove(id)).resolves.toBe(coffee);
      expect(coffee.deleteOne).toHaveBeenCalledTimes(1);
    });
  });

  describe('recommendCoffee', () => {
    it('increments recommendations and saves the coffee and event atomically', async () => {
      const id = objectId();
      const coffee = {
        id,
        title: 'Latte',
        recommendations: 2,
        save: jest.fn().mockResolvedValue(undefined),
        populate: jest.fn().mockResolvedValue(undefined),
      };
      coffeeModel.findById.mockReturnValue(createQueryMock(coffee));
      eventModel.create.mockResolvedValue([{}]);

      await expect(service.recommendCoffee(id)).resolves.toBe(coffee);

      expect(coffee.recommendations).toBe(3);
      expect(coffee.save).toHaveBeenCalledWith({ session });
      expect(eventModel.create).toHaveBeenCalledWith(
        [
          {
            type: 'coffee',
            name: 'recommend_coffee',
            payload: { coffeeId: id },
          },
        ],
        { session },
      );
      expect(session.endSession).toHaveBeenCalledTimes(1);
    });
  });
});
