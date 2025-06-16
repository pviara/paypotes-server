import { DateService } from '@app/shared/date/date.service';

export class DefaultDateService implements DateService {
    getCurrentDate(): Date {
        return new Date();
    }
}
