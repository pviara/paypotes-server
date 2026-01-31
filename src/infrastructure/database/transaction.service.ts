import { Injectable, Logger } from '@nestjs/common';
import { InjectKnex } from 'nestjs-knex';
import { Knex } from 'knex';

@Injectable()
export class TransactionService {
    private logger = new Logger(TransactionService.name);

    constructor(@InjectKnex() private knex: Knex) {}

    async execute<T>(
        callback: (transaction: Knex.Transaction) => Promise<T>,
    ): Promise<T> {
        try {
            return await this.knex.transaction(callback);
        } catch (error) {
            this.logger.error('Transaction failed and was rolled back', error);
            throw error;
        }
    }
}
