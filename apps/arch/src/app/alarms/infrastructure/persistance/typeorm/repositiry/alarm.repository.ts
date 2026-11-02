import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { AlarmRepository } from '../../../../application/ports/alarm.repository';
import { Repository } from 'typeorm';
import { AlarmEntity } from '../entity/alarm.entity';
import { Alarm } from '../../../../domain/alarm';
import { AlarmMapper } from '../mappers/alarm.mapper';

@Injectable()
export class OrmAlarmRepository implements AlarmRepository {
  constructor(
    @InjectRepository(AlarmEntity)
    private readonly alarmRepository: Repository<AlarmEntity>,
  ) {}

  async findAll(): Promise<Alarm[]> {
    const entities = await this.alarmRepository.find();

    return entities.map((e) => AlarmMapper.toDomain(e));
  }

  async save(alarm: Alarm): Promise<Alarm> {
    const persistanceModel = AlarmMapper.toPersistance(alarm);

    const newEntity = await this.alarmRepository.save(persistanceModel);

    return AlarmMapper.toDomain(newEntity);
  }
}
