import { Expense } from '@expenses/domain/expense/expense';
import { Group } from '@groups/domain/group';
import { GroupExpense } from '@expenses/domain/expense/group/group-expense';
import { PairExpense } from '@expenses/domain/expense/pair/pair-expense';
import { setTimeout } from 'timers/promises';

export type ExpensesByContact = {
    [contactId: string]: Array<PairExpense>;
};

export type ExpensesByGroup = {
    [groupId: string]: Array<GroupExpense>;
};

export interface ExpenseRepository {
    delete(expenseId: string): Promise<void>;
    getActorContactExpenseById(
        actorId: string,
        contactId: string,
        expenseId: string,
    ): Promise<PairExpense | null>;
    getActorContactExpenses(
        actorId: string,
        contactId: string,
        pageIndex: number,
        search: string,
    ): Promise<Expense[]>;
    getActorExpenseById(
        actorId: string,
        expenseId: string,
    ): Promise<Expense | null>;
    getActorExpenses(
        actorId: string,
        pageIndex: number,
        search: string,
    ): Promise<Expense[]>;
    getActorGroupExpenseById(
        actorId: string,
        groupId: string,
        expenseId: string,
    ): Promise<GroupExpense | null>;
    getActorGroupExpenses(
        actorId: string,
        group: Group,
        pageIndex: number,
        search: string,
    ): Promise<GroupExpense[]>;
    getAllActorContactExpenses(
        actorId: string,
        contactId: string,
    ): Promise<PairExpense[]>;
    getAllActorContactsExpenses(
        actorId: string,
        contactIds: Array<string>,
    ): Promise<ExpensesByContact>;
    getAllActorExpenses(actorId: string): Promise<Expense[]>;
    getAllActorGroupExpenses(
        actorId: string,
        group: Group,
    ): Promise<GroupExpense[]>;
    getAllActorGroupsExpenses(
        actorId: string,
        groups: Array<Group>,
    ): Promise<ExpensesByGroup>;
    saveGroupExpense(expense: GroupExpense): Promise<void>;
    savePairExpense(expense: PairExpense): Promise<void>;
    updatePairExpense(expense: PairExpense): Promise<void>;
    updateGroupExpense(expense: GroupExpense): Promise<void>;
}
