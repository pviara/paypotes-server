import { DefaultDateService } from '@app/shared/date/default.date-service';
import { Provider } from '@nestjs/common';

export const dateServiceProviderToken = 'DateService';
export const dateServiceProvider: Provider = {
    provide: dateServiceProviderToken,
    useClass: DefaultDateService,
};
