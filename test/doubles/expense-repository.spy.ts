import { Expense } from '@expenses/domain/expense';
import {
    ExpenseRepository,
    ExpensesByContact,
} from '@expenses/persistence/expense.repository';
import { GroupExpense } from '@expenses/domain/group-expense';
import { PairExpense } from '@expenses/domain/pair-expense';
import { Spy } from '@test/helpers/spy';

export class ExpenseRepositorySpy
    extends Spy<ExpenseRepository>
    implements ExpenseRepository
{
    readonly calls = {
        delete: {
            count: 0,
            history: [] as Array<string>,
        },
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
        getAllActorContactExpenses: {
            count: 0,
            history: [] as Array<[string, string]>,
        },
        getAllActorContactsExpenses: {
            count: 0,
            history: [] as Array<[string, string[]]>,
        },
        getAllActorExpenses: {
            count: 0,
            history: [] as Array<string>,
        },
        getAllActorGroupExpenses: {
            count: 0,
            history: [] as Array<[string, string]>,
        },
        save: {
            count: 0,
            history: [] as Array<Expense>,
        },
    };

    async delete(expenseId: string): Promise<void> {
        this.calls.delete.count++;
        this.calls.delete.history.push(expenseId);
        return this.getStubOrDefault('delete', undefined);
    }

    async getActorContactExpenseById(
        actorId: string,
        contactId: string,
        expenseId: string,
    ): Promise<PairExpense | null> {
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
    ): Promise<PairExpense[]> {
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
    ): Promise<GroupExpense | null> {
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
    ): Promise<GroupExpense[]> {
        this.calls.getActorGroupExpenses.count++;
        this.calls.getActorGroupExpenses.history.push([
            actorId,
            groupId,
            pageIndex,
            search,
        ]);
        return this.getStubOrDefault('getActorGroupExpenses', []);
    }

    async getAllActorContactExpenses(
        actorId: string,
        contactId: string,
    ): Promise<PairExpense[]> {
        this.calls.getAllActorContactExpenses.count++;
        this.calls.getAllActorContactExpenses.history.push([
            actorId,
            contactId,
        ]);
        return this.getStubOrDefault('getAllActorContactExpenses', []);
    }

    async getAllActorContactsExpenses(
        actorId: string,
        contactIds: Array<string>,
    ): Promise<ExpensesByContact> {
        this.calls.getAllActorContactsExpenses.count++;
        this.calls.getAllActorContactsExpenses.history.push([
            actorId,
            contactIds,
        ]);
        return this.getStubOrDefault('getAllActorContactsExpenses', {});
    }

    async getAllActorExpenses(actorId: string): Promise<Expense[]> {
        this.calls.getAllActorExpenses.count++;
        this.calls.getAllActorExpenses.history.push(actorId);
        return this.getStubOrDefault('getAllActorExpenses', []);
    }

    async getAllActorGroupExpenses(
        actorId: string,
        groupId: string,
    ): Promise<GroupExpense[]> {
        this.calls.getAllActorGroupExpenses.count++;
        this.calls.getAllActorGroupExpenses.history.push([actorId, groupId]);
        return this.getStubOrDefault('getAllActorGroupExpenses', []);
    }

    async save(expense: Expense): Promise<void> {
        this.calls.save.count++;
        this.calls.save.history.push(expense);
        this.getStubOrDefault('save', undefined);
    }
}
