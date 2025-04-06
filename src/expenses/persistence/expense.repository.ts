import { Expense } from '@expenses/domain/expense';
import { GroupExpense } from '@expenses/domain/group-expense';
import { PairExpense } from '@expenses/domain/pair-expense';
import { setTimeout } from 'timers/promises';

export type ExpensesByContact = {
    [contactId: string]: Array<Expense>;
};

export type ExpensesByGroup = {
    [groupId: string]: Array<Expense>;
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
    ): Promise<PairExpense[]>;
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
        groupId: string,
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
        groupId: string,
    ): Promise<GroupExpense[]>;
    getAllActorGroupsExpenses(
        actorId: string,
        groupIds: Array<string>,
    ): Promise<ExpensesByGroup>;
    save(expense: Expense): Promise<void>;
}

const MAX_EXPENSES_PER_PAGE = 20;

export class ExpenseInMemoryRepository implements ExpenseRepository {
    protected expenses: Array<Expense> = [];

    async delete(expenseId: string): Promise<void> {
        const index = this.expenses.findIndex(this.expenseMatches(expenseId));
        if (this.valid(index)) this.expenses.splice(index, 1);
    }

    async getActorContactExpenseById(
        actorId: string,
        contactId: string,
        expenseId: string,
    ): Promise<PairExpense | null> {
        const expense = this.expenses
            .filter((expense) => expense instanceof PairExpense)
            .filter(this.isPairExpenseOf(actorId, contactId))
            .find(this.expenseMatches(expenseId));

        return expense ?? null;
    }

    async getActorContactExpenses(
        actorId: string,
        contactId: string,
        pageIndex: number,
        search: string,
    ): Promise<PairExpense[]> {
        const start = pageIndex * MAX_EXPENSES_PER_PAGE;
        return this.expenses
            .filter(this.isPairExpense())
            .filter(this.isPairExpenseOf(actorId, contactId))
            .filter(this.expenseLabelMatches(search))
            .slice(start, start + MAX_EXPENSES_PER_PAGE);
    }

    async getActorExpenseById(
        actorId: string,
        expenseId: string,
    ): Promise<Expense | null> {
        const expense = this.expenses
            .filter(this.isExpenseOf(actorId))
            .find(this.expenseMatches(expenseId));

        return expense ?? null;
    }

    async getActorExpenses(
        actorId: string,
        pageIndex: number,
        search: string,
    ): Promise<Expense[]> {
        const start = pageIndex * MAX_EXPENSES_PER_PAGE;
        return this.expenses
            .filter(this.isExpenseOf(actorId))
            .filter(this.expenseLabelMatches(search))
            .slice(start, start + MAX_EXPENSES_PER_PAGE);
    }

    async getActorGroupExpenseById(
        actorId: string,
        groupId: string,
        expenseId: string,
    ): Promise<GroupExpense | null> {
        const expense = this.expenses
            .filter(this.isGroupExpense())
            .filter(this.isExpenseFrom(groupId))
            .filter(this.isGroupExpenseOf(actorId))
            .find(this.expenseMatches(expenseId));

        return expense ?? null;
    }

    async getActorGroupExpenses(
        actorId: string,
        groupId: string,
        pageIndex: number,
        search: string,
    ): Promise<GroupExpense[]> {
        const start = pageIndex * MAX_EXPENSES_PER_PAGE;
        return this.expenses
            .filter(this.isGroupExpense())
            .filter(this.isExpenseFrom(groupId))
            .filter(this.isGroupExpenseOf(actorId))
            .filter(this.expenseLabelMatches(search))
            .slice(start, start + MAX_EXPENSES_PER_PAGE);
    }

    async getAllActorContactExpenses(
        actorId: string,
        contactId: string,
    ): Promise<PairExpense[]> {
        return this.expenses
            .filter(this.isPairExpense())
            .filter(this.isPairExpenseOf(actorId, contactId));
    }

    async getAllActorContactsExpenses(
        actorId: string,
        contactIds: Array<string>,
    ): Promise<ExpensesByContact> {
        const expensesByContact: ExpensesByContact = {};
        for (const contactId of contactIds) {
            expensesByContact[contactId] =
                await this.getAllActorContactExpenses(actorId, contactId);
        }

        return expensesByContact;
    }

    async getAllActorExpenses(actorId: string): Promise<Expense[]> {
        return this.expenses.filter(this.isExpenseOf(actorId));
    }

    async getAllActorGroupExpenses(
        actorId: string,
        groupId: string,
    ): Promise<GroupExpense[]> {
        return this.expenses
            .filter(this.isGroupExpense())
            .filter(this.isExpenseFrom(groupId))
            .filter(this.isGroupExpenseOf(actorId));
    }

    async getAllActorGroupsExpenses(
        actorId: string,
        groupIds: Array<string>,
    ): Promise<ExpensesByGroup> {
        const expensesByGroup: ExpensesByGroup = {};
        for (const groupId of groupIds) {
            expensesByGroup[groupId] = await this.getAllActorGroupExpenses(
                actorId,
                groupId,
            );
        }

        return expensesByGroup;
    }

    async save(expense: Expense): Promise<void> {
        const currentExpenses = [...this.expenses];
        await setTimeout(Math.random() * 10);
        this.expenses = [...currentExpenses, expense];
    }

    private expenseMatches(expenseId: string): (expense: Expense) => boolean {
        return (expense) => expense.getId() === expenseId;
    }

    private isExpenseOf(actorId: string): (expense: Expense) => boolean {
        return (expense: Expense) => expense.involves(actorId);
    }

    private valid(index: number): boolean {
        return index > -1;
    }

    private isPairExpense(): (value: Expense) => value is PairExpense {
        return (expense) => expense instanceof PairExpense;
    }

    private isPairExpenseOf(
        actorId: string,
        contactId?: string,
    ): (expense: PairExpense) => boolean {
        return (expense: PairExpense) =>
            contactId
                ? expense.involves(actorId, contactId)
                : expense.involves(actorId);
    }

    private isGroupExpense(): (value: Expense) => value is GroupExpense {
        return (expense) => expense instanceof GroupExpense;
    }

    private isGroupExpenseOf(
        actorId: string,
    ): (expense: GroupExpense) => boolean {
        return (expense: GroupExpense) => expense.involves(actorId);
    }

    private isExpenseFrom(groupId: string): (expense: GroupExpense) => boolean {
        return (expense: GroupExpense) => expense.belongsTo(groupId);
    }

    private expenseLabelMatches(search: string): (expense: Expense) => boolean {
        const lowercasedSearch = search.toLowerCase();
        return (expense) =>
            expense.getLabel().toLowerCase().includes(lowercasedSearch);
    }
}
