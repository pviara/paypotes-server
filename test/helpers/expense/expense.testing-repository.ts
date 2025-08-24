import { GroupExpense } from '@app/expenses/domain/expense/group/group-expense';
import { PairExpense } from '@app/expenses/domain/expense/pair/pair-expense';
import { Expense } from '@expenses/domain/expense/expense';
import { ExpensePostgresRepository } from '@expenses/persistence/expense.postgres-repository';
import { Table } from '@infra/postgres/table';

export class ExpensePostgresTestingRepository extends ExpensePostgresRepository {
    async empty(): Promise<void> {
        await this.knex.delete().from(Table.Stakeholders);
        await this.knex.delete().from(Table.Expenses);
    }

    async expenseSaved(id: string): Promise<boolean> {
        const rows = await this.knex
            .select('*')
            .from(Table.Expenses)
            .where('id', id);
        return rows.length > 0;
    }

    async insert(...expenses: Array<Expense>): Promise<void> {
        for (const expense of expenses) {
            if (expense instanceof GroupExpense) {
                const record = this.mapGroupExpenseRecordFrom(expense);
                await this.knex.insert(record).into(Table.Expenses);
            } else if (expense instanceof PairExpense) {
                const record = this.mapPairExpenseRecordFrom(expense);
                await this.knex.insert(record).into(Table.Expenses);
            }

            const stakeholders = expense
                .getStakeholders()
                .map((stakeholder) =>
                    this.mapStakeholderRecordFrom(stakeholder, expense),
                );
            await this.knex.insert(stakeholders).into(Table.Stakeholders);
        }
    }

    async get(id: string): Promise<Expense> {
        const record = await this.knex
            .select('*')
            .from(Table.Expenses)
            .where('id', id)
            .first();
        return record ?? null;
    }
}
