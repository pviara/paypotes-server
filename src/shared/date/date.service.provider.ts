import { DateService } from '@app/shared/date/date.service';
import { DefaultDateService } from '@app/shared/date/default.date-service';
import { Provider } from '@nestjs/common';

export const dateServiceProvider: Provider = {
    provide: DateService,
    useClass: DefaultDateService,
};
