import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AlarmsModule } from './alarms/application/alarms.module';
import { AppCoreModule } from './core/app-core.module';
import { ApplicationBootstrapOptions } from './common/interfaces/application-bootstrap-options.interface';
import { AlarmsInfrastructureModule } from './alarms/infrastructure/alarms-infrastructure.module';

@Module({
  imports: [AppCoreModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  static register(options: ApplicationBootstrapOptions) {
    return {
      module: AppModule,
      imports: [
        AppCoreModule.forRoot(options),
        AlarmsModule.withInfrastructure(
          AlarmsInfrastructureModule.use(options.driver),
        ),
      ],
    };
  }
}
