import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { AlarmRepository } from '../../../../application/ports/alarm.repository';
import { Repository } from 'typeorm';
import { AlarmEntity } from '../entity/alarm.entity';
import { Alarm } from '../../../../domain/alarm';
import { AlarmMapper } from '../mappers/alarm.mapper';

@Injectable()
export class InMemoryAlarmRepository implements AlarmRepository {
  private readonly alarms = new Map<string, AlarmEntity>();

  async findAll(): Promise<Alarm[]> {
    const entities = Array.from(this.alarms.values());

    return entities.map((e) => AlarmMapper.toDomain(e));
  }

  async save(alarm: Alarm): Promise<Alarm> {
    const persistanceModel = AlarmMapper.toPersistance(alarm);
    this.alarms.set(persistanceModel.id, persistanceModel);

    const newEntity = this.alarms.get(persistanceModel.id)!;

    return AlarmMapper.toDomain(newEntity);
  }
}
