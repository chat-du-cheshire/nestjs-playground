import { Injectable } from '@nestjs/common';
import { CreateAlarmCommand } from './comands/create-alarm.command';
import { AlarmRepository } from './ports/alarm.repository';
import { AlarmFactory } from '../domain/factories/alarm.factory';

@Injectable()
export class AlarmsService {
  constructor(
    private readonly repository: AlarmRepository,
    private readonly factory: AlarmFactory,
  ) {}

  create(createAlarmDto: CreateAlarmCommand) {
    const alarm = this.factory.create(
      createAlarmDto.name,
      createAlarmDto.severity,
    );

    return this.repository.save(alarm);
  }

  findAll() {
    return this.repository.findAll();
  }
}
