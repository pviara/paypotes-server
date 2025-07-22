import { Expense } from '@expenses/domain/expense';
import {
    ExpenseRepository,
    ExpensesByContact,
    ExpensesByGroup,
} from '@expenses/persistence/expense.repository';
import { GroupExpense } from '@expenses/domain/group-expense/group-expense';
import { PairExpense } from '@app/expenses/domain/pair-expense/pair-expense';
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
        getAllActorGroupsExpenses: {
            count: 0,
            history: [] as Array<[string, string[]]>,
        },
        save: {
            count: 0,
            history: [] as Array<Expense>,
        },
    };

    async delete(expenseId: string): Promise<void> {
        this.saveCall('delete', expenseId);
        return this.getStubOrDefault('delete', undefined);
    }

    async getActorContactExpenseById(
        actorId: string,
        contactId: string,
        expenseId: string,
    ): Promise<PairExpense | null> {
        this.saveCall('getActorContactExpenseById', [
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
        this.saveCall('getActorContactExpenses', [
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
        this.saveCall('getActorExpenseById', [actorId, expenseId]);
        return this.getStubOrDefault('getActorExpenseById', null);
    }

    async getActorExpenses(
        actorId: string,
        pageIndex: number,
        search: string,
    ): Promise<Expense[]> {
        this.saveCall('getActorExpenses', [actorId, pageIndex, search]);
        return this.getStubOrDefault('getActorExpenses', []);
    }

    async getActorGroupExpenseById(
        actorId: string,
        groupId: string,
        expenseId: string,
    ): Promise<GroupExpense | null> {
        this.saveCall('getActorGroupExpenseById', [
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
        this.saveCall('getActorGroupExpenses', [
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
        this.saveCall('getAllActorContactExpenses', [actorId, contactId]);
        return this.getStubOrDefault('getAllActorContactExpenses', []);
    }

    async getAllActorContactsExpenses(
        actorId: string,
        contactIds: Array<string>,
    ): Promise<ExpensesByContact> {
        this.saveCall('getAllActorContactsExpenses', [actorId, contactIds]);
        return this.getStubOrDefault('getAllActorContactsExpenses', {});
    }

    async getAllActorExpenses(actorId: string): Promise<Expense[]> {
        this.saveCall('getAllActorExpenses', actorId);
        return this.getStubOrDefault('getAllActorExpenses', []);
    }

    async getAllActorGroupExpenses(
        actorId: string,
        groupId: string,
    ): Promise<GroupExpense[]> {
        this.saveCall('getAllActorGroupExpenses', [actorId, groupId]);
        return this.getStubOrDefault('getAllActorGroupExpenses', []);
    }

    async getAllActorGroupsExpenses(
        actorId: string,
        groupIds: Array<string>,
    ): Promise<ExpensesByGroup> {
        this.saveCall('getAllActorGroupsExpenses', [actorId, groupIds]);
        return this.getStubOrDefault('getAllActorGroupsExpenses', {});
    }

    async save(expense: Expense): Promise<void> {
        this.saveCall('save', expense);
        this.getStubOrDefault('save', undefined);
    }
}
