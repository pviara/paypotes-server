import {
    dateServiceProvider,
    dateServiceProviderToken,
} from '@app/shared/date/date.service.provider';
import { Module } from '@nestjs/common';

@Module({
    exports: [dateServiceProviderToken],
    providers: [dateServiceProvider],
})
export class DateModule {}
