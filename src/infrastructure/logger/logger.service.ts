import { ConsoleLogger, Injectable } from '@nestjs/common';

type Log = {
    date: string;
    message: string;
    context: string;
    args: Array<unknown>;
};

@Injectable()
export class DefaultLoggerService extends ConsoleLogger {
    constructor(options: { colors: boolean }) {
        super(options);
    }

    override debug(
        message: string,
        context: string,
        ...args: Array<unknown>
    ): void {
        const log: Log = this.createLogFrom(message, context, args);
        console.debug(JSON.stringify(log));
    }

    override error(
        message: string,
        context: string,
        ...args: Array<unknown>
    ): void {
        const log: Log = this.createLogFrom(message, context, args);
        console.error(JSON.stringify(log));
    }

    override log(
        message: string,
        context: string,
        ...args: Array<unknown>
    ): void {
        const log: Log = this.createLogFrom(message, context, args);
        console.log(JSON.stringify(log));
    }

    private createLogFrom(
        message: string,
        context: string,
        args: Array<unknown>,
    ): Log {
        const now = new Date().toISOString();
        const log: Log = {
            date: now,
            message,
            context,
            args,
        };
        return log;
    }
}
