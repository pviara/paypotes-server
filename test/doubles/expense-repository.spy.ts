import { Expense } from '@expenses/domain/expense';
import { ExpenseRepository } from '@expenses/persistence/expense.repository';
import { Spy } from '@test/helpers/spy';

export class ExpenseRepositorySpy
    extends Spy<ExpenseRepository>
    implements ExpenseRepository
{
    readonly calls = {
        getActorContactExpenseById: {
            count: 0,
            history: [] as Array<[string, string, string]>,
        },
        getActorContactExpenses: {
            count: 0,
            history: [] as Array<[string, string, number, string]>,
        },
        getActorExpenseById: {
            count: 0,
            history: [] as Array<[string, string]>,
        },
        getActorExpenses: {
            count: 0,
            history: [] as Array<[string, number, string]>,
        },
        getActorGroupExpenseById: {
            count: 0,
            history: [] as Array<[string, string, string]>,
        },
        getActorGroupExpenses: {
            count: 0,
            history: [] as Array<[string, string, number, string]>,
        },
    };

    async getActorContactExpenseById(
        actorId: string,
        contactId: string,
        expenseId: string,
    ): Promise<Expense | null> {
        this.calls.getActorContactExpenseById.count++;
        this.calls.getActorContactExpenseById.history.push([
            actorId,
            contactId,
            expenseId,
        ]);
        return this.getStubOrDefault('getActorContactExpenseById', null);
    }

    async getActorContactExpenses(
        actorId: string,
        contactId: string,
        pageIndex: number,
        search: string,
    ): Promise<Expense[]> {
        this.calls.getActorContactExpenses.count++;
        this.calls.getActorContactExpenses.history.push([
            actorId,
            contactId,
            pageIndex,
            search,
        ]);
        return this.getStubOrDefault('getActorContactExpenses', []);
    }

    async getActorExpenseById(
        actorId: string,
        expenseId: string,
    ): Promise<Expense | null> {
        this.calls.getActorExpenseById.count++;
        this.calls.getActorExpenseById.history.push([actorId, expenseId]);
        return this.getStubOrDefault('getActorExpenseById', null);
    }

    async getActorExpenses(
        actorId: string,
        pageIndex: number,
        search: string,
    ): Promise<Expense[]> {
        this.calls.getActorExpenses.count++;
        this.calls.getActorExpenses.history.push([actorId, pageIndex, search]);
        return this.getStubOrDefault('getActorExpenses', []);
    }

    async getActorGroupExpenseById(
        actorId: string,
        groupId: string,
        expenseId: string,
    ): Promise<Expense | null> {
        this.calls.getActorGroupExpenseById.count++;
        this.calls.getActorGroupExpenseById.history.push([
            actorId,
            groupId,
            expenseId,
        ]);
        return this.getStubOrDefault('getActorGroupExpenseById', null);
    }

    async getActorGroupExpenses(
        actorId: string,
        groupId: string,
        pageIndex: number,
        search: string,
    ): Promise<Expense[]> {
        this.calls.getActorGroupExpenses.count++;
        this.calls.getActorGroupExpenses.history.push([
            actorId,
            groupId,
            pageIndex,
            search,
        ]);
        return this.getStubOrDefault('getActorGroupExpenses', []);
    }
}
