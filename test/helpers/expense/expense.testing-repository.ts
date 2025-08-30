import { Expense } from '@expenses/domain/expense/expense';
import { ExpensePostgresRepository } from '@expenses/persistence/expense.postgres-repository';
import { GroupExpense } from '@expenses/domain/expense/group/group-expense';
import { PairExpense } from '@expenses/domain/expense/pair/pair-expense';
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

    async get(id: string, actorId?: string): Promise<Expense | null> {
        const {
            rows: [expense],
        } = await this.knex.raw(`
            with verified_expense as (
                select *
                from ${Table.Expenses}
                where id = '${id}'
            ), actor_stakeholder as (
                select
                    id,
                    share
                from ${Table.Stakeholders}
                where expense_id = '${id}'
            )
            select ve.*
            from verified_expense ve;
        `);

        if (expense) {
            const group = await this.groupRepository.getActorGroupById(
                actorId ?? '',
                expense.group_id,
            );

            const { rows: stakeholders } = await this.knex.raw(`
                select
                    ${Table.Users}.id,
                    ${Table.Users}.firstname,
                    ${Table.Users}.lastname,
                    ${Table.Users}.avatar_url,
                    ${Table.Stakeholders}.creditor,
                    ${Table.Stakeholders}.share
                from ${Table.Stakeholders}
                inner join ${Table.Users}
                    on ${Table.Users}.id = ${Table.Stakeholders}.id
                where ${Table.Stakeholders}.expense_id = '${expense.id}'
            `);

            return this.mapExpenseFrom({
                id: expense.id,
                label: expense.label,
                emoji: expense.emoji,
                created_at: expense.created_at,
                balance: expense.balance,
                group_id: expense.group_id,
                stakeholders,
                group,
            });
        }
        return null;
    }
}
