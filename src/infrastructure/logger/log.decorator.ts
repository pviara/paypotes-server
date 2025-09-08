import { DefaultLoggerService } from '@infra/logger/logger.service';
import { Inject, LogLevel } from '@nestjs/common';

export const Log = (level: LogLevel) => {
    const injectLogger = Inject(DefaultLoggerService);

    return (target: any, propertyKey: string, descriptor: any) => {
        injectLogger(target, 'logger');

        const decoratedMethod = descriptor.value;
        descriptor.value = async function (
            ...args: Array<unknown>
        ): Promise<unknown> {
            const context = target.constructor.name;
            this.logger.setContext(context);

            try {
                this.logger[level](`Called method "${propertyKey}"`);
                return await decoratedMethod.apply(this, args);
            } catch (error: any) {
                this.logger.error(`Error thrown: ${error['message']}`);
                throw error;
            }
        };
    };
};
