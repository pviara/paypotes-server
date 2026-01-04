import { DateService } from '@app/shared/date/date.service';
import { dateServiceProvider } from '@app/shared/date/date.service.provider';
import { Module } from '@nestjs/common';

@Module({
    exports: [DateService],
    providers: [dateServiceProvider],
})
export class DateModule {}
