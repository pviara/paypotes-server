import { DateService } from '@app/shared/date/date.service';
import { Spy } from '@test/helpers/spy';

export class DateServiceSpy extends Spy<DateService> implements DateService {
    private DEFAULT_DATE = new Date('1990-09-09');

    readonly calls = {
        getCurrentDate: {
            count: 0,
            history: [],
        },
    };

    getCurrentDate(): Date {
        this.saveCall('getCurrentDate', undefined);
        return this.getStubOrDefault('getCurrentDate', this.DEFAULT_DATE);
    }
}
