import { Module } from '@nestjs/common';
import { OrmAlarmPersistanceModule } from './persistance/typeorm/orm-alarm.module';
import { InMemoryAlarmPersistanceModule } from './persistance/in-memory/in-memory-alarm.module';

@Module({})
export class AlarmsInfrastructureModule {
  static use(drive: 'in-memory' | 'orm') {
    const module =
      drive === 'orm'
        ? OrmAlarmPersistanceModule
        : InMemoryAlarmPersistanceModule;

    return {
      module: AlarmsInfrastructureModule,
      imports: [module],
      exports: [module],
    };
  }
}
