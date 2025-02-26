import { ExpenseController } from '@expenses/presentation/expense.controller';
import { Module } from '@nestjs/common';

@Module({
    controllers: [ExpenseController],
})
export class ExpenseModule {}
