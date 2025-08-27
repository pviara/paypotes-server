import { Expense } from '@expenses/domain/expense/expense';
import {
    ExpenseRepository,
    ExpensesByContact,
    ExpensesByGroup,
} from '@expenses/persistence/expense.repository';
import { Group } from '@groups/domain/group';
import { GroupExpense } from '@expenses/domain/expense/group/group-expense';
import { PairExpense } from '@expenses/domain/expense/pair/pair-expense';
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
            history: [] as Array<[string, Group, number, string]>,
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
            history: [] as Array<[string, Group]>,
        },
        getAllActorGroupsExpenses: {
            count: 0,
            history: [] as Array<[string, string[]]>,
        },
        saveGroupExpense: {
            count: 0,
            history: [] as Array<GroupExpense>,
        },
        savePairExpense: {
            count: 0,
            history: [] as Array<PairExpense>,
        },
        updateGroupExpense: {
            count: 0,
            history: [] as Array<PairExpense>,
        },
        updatePairExpense: {
            count: 0,
            history: [] as Array<PairExpense>,
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
        group: Group,
        pageIndex: number,
        search: string,
    ): Promise<GroupExpense[]> {
        this.saveCall('getActorGroupExpenses', [
            actorId,
            group,
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
        group: Group,
    ): Promise<GroupExpense[]> {
        this.saveCall('getAllActorGroupExpenses', [actorId, group]);
        return this.getStubOrDefault('getAllActorGroupExpenses', []);
    }

    async getAllActorGroupsExpenses(
        actorId: string,
        groupIds: Array<string>,
    ): Promise<ExpensesByGroup> {
        this.saveCall('getAllActorGroupsExpenses', [actorId, groupIds]);
        return this.getStubOrDefault('getAllActorGroupsExpenses', {});
    }

    async saveGroupExpense(expense: GroupExpense): Promise<void> {
        this.saveCall('saveGroupExpense', expense);
        this.getStubOrDefault('saveGroupExpense', undefined);
    }

    async savePairExpense(expense: PairExpense): Promise<void> {
        this.saveCall('savePairExpense', expense);
        this.getStubOrDefault('savePairExpense', undefined);
    }

    async updateGroupExpense(expense: GroupExpense): Promise<void> {
        this.saveCall('updateGroupExpense', expense);
        this.getStubOrDefault('updateGroupExpense', undefined);
    }

    async updatePairExpense(expense: PairExpense): Promise<void> {
        this.saveCall('updatePairExpense', expense);
        this.getStubOrDefault('updatePairExpense', undefined);
    }
}
