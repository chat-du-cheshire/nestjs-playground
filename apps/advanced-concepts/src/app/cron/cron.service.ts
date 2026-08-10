import { IntervalHost } from '../scheduler/decorators/interval-host.decorator';
import { Interval } from '../scheduler/decorators/interval.decorator';

@IntervalHost()
export class CronService {
    @Interval(1000)
    tick() {
        console.log('CronService tick', new Date().toISOString());
    }
}
