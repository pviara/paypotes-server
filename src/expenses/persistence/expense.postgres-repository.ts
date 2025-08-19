import {
    ExpenseRepository,
    ExpensesByContact,
    ExpensesByGroup,
} from '@expenses/persistence/expense.repository';
import { Expense } from '../domain/expense/expense';
import { GroupExpense } from '@expenses/domain/expense/group/group-expense';
import { InjectKnex } from 'nestjs-knex';
import { Knex } from 'knex';
import { PairExpense } from '@expenses/domain/expense/pair/pair-expense';
import { Table } from '@infra/postgres/table';

export class ExpensePostgresRepository implements ExpenseRepository {
    constructor(@InjectKnex() protected knex: Knex) {}

    async delete(expenseId: string): Promise<void> {
        await this.knex.delete().from(Table.Expenses).where('id', expenseId);
    }

    getActorContactExpenseById(
        actorId: string,
        contactId: string,
        expenseId: string,
    ): Promise<PairExpense | null> {
        throw new Error('Method not implemented.');
    }

    getActorContactExpenses(
        actorId: string,
        contactId: string,
        pageIndex: number,
        search: string,
    ): Promise<PairExpense[]> {
        throw new Error('Method not implemented.');
    }

    getActorExpenseById(
        actorId: string,
        expenseId: string,
    ): Promise<Expense | null> {
        throw new Error('Method not implemented.');
    }

    getActorExpenses(
        actorId: string,
        pageIndex: number,
        search: string,
    ): Promise<Expense[]> {
        throw new Error('Method not implemented.');
    }

    getActorGroupExpenseById(
        actorId: string,
        groupId: string,
        expenseId: string,
    ): Promise<GroupExpense | null> {
        throw new Error('Method not implemented.');
    }

    getActorGroupExpenses(
        actorId: string,
        groupId: string,
        pageIndex: number,
        search: string,
    ): Promise<GroupExpense[]> {
        throw new Error('Method not implemented.');
    }

    getAllActorContactExpenses(
        actorId: string,
        contactId: string,
    ): Promise<PairExpense[]> {
        throw new Error('Method not implemented.');
    }

    getAllActorContactsExpenses(
        actorId: string,
        contactIds: Array<string>,
    ): Promise<ExpensesByContact> {
        throw new Error('Method not implemented.');
    }

    getAllActorExpenses(actorId: string): Promise<Expense[]> {
        throw new Error('Method not implemented.');
    }

    getAllActorGroupExpenses(
        actorId: string,
        groupId: string,
    ): Promise<GroupExpense[]> {
        throw new Error('Method not implemented.');
    }

    getAllActorGroupsExpenses(
        actorId: string,
        groupIds: Array<string>,
    ): Promise<ExpensesByGroup> {
        throw new Error('Method not implemented.');
    }

    saveGroupExpense(expense: GroupExpense): Promise<void> {
        throw new Error('Method not implemented.');
    }

    savePairExpense(expense: PairExpense): Promise<void> {
        throw new Error('Method not implemented.');
    }
}
