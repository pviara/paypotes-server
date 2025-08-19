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
        // todo
        // // for (const expense of expenses) {
        // //     const groupId =
        // //         expense instanceof GroupExpense
        // //             ? expense.getGroup().getId()
        // //             : this.configService.getOrThrow('DEFAULT_UUID');
        // // }
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
