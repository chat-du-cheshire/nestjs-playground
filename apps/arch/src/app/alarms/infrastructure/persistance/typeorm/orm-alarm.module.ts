import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { AlarmEntity } from './entity/alarm.entity';
import { AlarmRepository } from '../../../application/ports/alarm.repository';
import { OrmAlarmRepository } from './repositiry/alarm.repository';

@Module({
  imports: [TypeOrmModule.forFeature([AlarmEntity])],
  providers: [{ provide: AlarmRepository, useClass: OrmAlarmRepository }],
  exports: [AlarmRepository],
})
export class OrmAlarmPersistanceModule {}
