import { Global, Module } from '@nestjs/common';
import { DefaultLoggerService } from './logger.service';

@Global()
@Module({
    exports: [DefaultLoggerService],
    providers: [DefaultLoggerService],
})
export class LoggerModule {}
