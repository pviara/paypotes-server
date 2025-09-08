import { ConsoleLogger, Injectable } from '@nestjs/common';

@Injectable()
export class DefaultLoggerService extends ConsoleLogger {}
