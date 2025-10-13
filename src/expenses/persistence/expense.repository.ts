import { Expense } from '@expenses/domain/expense/expense';
import { Group } from '@groups/domain/group';
import { GroupExpense } from '@expenses/domain/expense/group/group-expense';
import { PairExpense } from '@expenses/domain/expense/pair/pair-expense';

export type ExpensesByContact = {
    [contactId: string]: Array<Expense>;
};

export type ExpensesByGroup = {
    [groupId: string]: Array<GroupExpense>;
};

export abstract class ExpenseRepository {
    abstract delete(expenseId: string): Promise<void>;
    abstract getActorContactExpenseById(
        actorId: string,
        contactId: string,
        expenseId: string,
    ): Promise<PairExpense | null>;
    abstract getActorContactExpenses(
        actorId: string,
        contactId: string,
        pageIndex: number,
        search: string,
    ): Promise<Expense[]>;
    abstract getActorExpenseById(
        actorId: string,
        expenseId: string,
    ): Promise<Expense | null>;
    abstract getActorExpenses(
        actorId: string,
        pageIndex: number,
        search: string,
    ): Promise<Expense[]>;
    abstract getActorGroupExpenseById(
        actorId: string,
        groupId: string,
        expenseId: string,
    ): Promise<GroupExpense | null>;
    abstract getActorGroupExpenses(
        actorId: string,
        group: Group,
        pageIndex: number,
        search: string,
    ): Promise<GroupExpense[]>;
    abstract getAllActorContactExpenses(
        actorId: string,
        contactId: string,
    ): Promise<PairExpense[]>;
    abstract getAllActorContactsExpenses(
        actorId: string,
        contactIds: Array<string>,
    ): Promise<ExpensesByContact>;
    abstract getAllActorExpenses(actorId: string): Promise<Expense[]>;
    abstract getAllActorGroupExpenses(
        actorId: string,
        group: Group,
    ): Promise<GroupExpense[]>;
    abstract getAllActorGroupsExpenses(
        actorId: string,
        groups: Array<Group>,
    ): Promise<ExpensesByGroup>;
    abstract saveGroupExpense(expense: GroupExpense): Promise<void>;
    abstract savePairExpense(expense: PairExpense): Promise<void>;
    abstract updatePairExpense(expense: PairExpense): Promise<void>;
    abstract updateGroupExpense(expense: GroupExpense): Promise<void>;
}
