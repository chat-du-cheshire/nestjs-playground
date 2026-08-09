import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ClientSession, Connection, Model, Types } from 'mongoose';
import { Coffee, CoffeeDocument } from './schemas/coffee.schema';
import { Flavor, FlavorDocument } from './schemas/flavor.schema';
import { Event, EventDocument } from '../events/schemas/event.schema';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';

@Injectable()
export class CoffeesService {
  constructor(
    @InjectModel(Coffee.name)
    private readonly coffeeModel: Model<CoffeeDocument>,
    @InjectModel(Flavor.name)
    private readonly flavorModel: Model<FlavorDocument>,
    @InjectModel(Event.name)
    private readonly eventModel: Model<EventDocument>,
    @InjectConnection()
    private readonly connection: Connection,
  ) {}

  findAll(paginationQuery: PaginationQueryDto): Promise<CoffeeDocument[]> {
    const { limit, offset } = paginationQuery;
    let query = this.coffeeModel.find().populate('flavors');

    if (offset) {
      query = query.skip(offset);
    }
    if (limit) {
      query = query.limit(limit);
    }

    return query.exec();
  }

  async findOne(id: string): Promise<CoffeeDocument> {
    const coffee = Types.ObjectId.isValid(id)
      ? await this.coffeeModel.findById(id).populate('flavors').exec()
      : null;

    if (!coffee) {
      throw new NotFoundException(`Coffee with id: ${id} not found`);
    }

    return coffee;
  }

  create(createCoffeeDto: CreateCoffeeDto): Promise<CoffeeDocument> {
    return this.withTransaction(async (session) => {
      const flavors = await this.preloadFlavorsByName(
        createCoffeeDto.flavors,
        session,
      );
      const [coffee] = await this.coffeeModel.create(
        [{ ...createCoffeeDto, flavors: flavors.map((f) => f._id) }],
        { session },
      );

      await coffee.populate('flavors');
      return coffee;
    });
  }

  update(
    id: string,
    updateCoffeeDto: UpdateCoffeeDto,
  ): Promise<CoffeeDocument> {
    return this.withTransaction(async (session) => {
      const { flavors: flavorNames, ...rest } = updateCoffeeDto;

      const flavors =
        flavorNames &&
        (await this.preloadFlavorsByName(flavorNames, session));

      const coffee = Types.ObjectId.isValid(id)
        ? await this.coffeeModel
            .findByIdAndUpdate(
              id,
              {
                ...rest,
                ...(flavors && { flavors: flavors.map((f) => f._id) }),
              },
              { returnDocument: 'after', session },
            )
            .populate('flavors')
        : null;

      if (!coffee) {
        throw new NotFoundException(`Coffee with id: ${id} not found`);
      }

      return coffee;
    });
  }

  async remove(id: string): Promise<CoffeeDocument> {
    const coffee = await this.findOne(id);
    await coffee.deleteOne();
    return coffee;
  }

  recommendCoffee(id: string): Promise<CoffeeDocument> {
    return this.withTransaction(async (session) => {
      const coffee = Types.ObjectId.isValid(id)
        ? await this.coffeeModel.findById(id).session(session)
        : null;

      if (!coffee) {
        throw new NotFoundException(`Coffee with id: ${id} not found`);
      }

      coffee.recommendations++;
      await coffee.save({ session });

      await this.eventModel.create(
        [
          {
            type: 'coffee',
            name: 'recommend_coffee',
            payload: { coffeeId: coffee.id },
          },
        ],
        { session },
      );

      await coffee.populate('flavors');
      return coffee;
    });
  }

  private async preloadFlavorsByName(
    names: string[],
    session: ClientSession,
  ): Promise<FlavorDocument[]> {
    // A ClientSession only supports one in-flight operation at a time, so
    // these must run sequentially rather than via Promise.all.
    const flavors: FlavorDocument[] = [];
    for (const name of names) {
      flavors.push(await this.preloadFlavorByName(name, session));
    }
    return flavors;
  }

  private async preloadFlavorByName(
    name: string,
    session: ClientSession,
  ): Promise<FlavorDocument> {
    const existingFlavor = await this.flavorModel
      .findOne({ name })
      .session(session);

    if (existingFlavor) {
      return existingFlavor;
    }

    const [created] = await this.flavorModel.create([{ name }], { session });
    return created;
  }

  private async withTransaction<T>(
    work: (session: ClientSession) => Promise<T>,
  ): Promise<T> {
    const session = await this.connection.startSession();

    try {
      let result: T | undefined;
      await session.withTransaction(async () => {
        result = await work(session);
      });
      return result as T;
    } finally {
      await session.endSession();
    }
  }
}
