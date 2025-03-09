import { Expense } from '@expenses/domain/expense';

export interface ExpenseRepository {
    getActorContactExpenseById(
        actorId: string,
        contactId: string,
        expenseId: string,
    ): Promise<Expense | null>;
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
    ): Promise<Expense | null>;
    getActorGroupExpenses(
        actorId: string,
        groupId: string,
        pageIndex: number,
        search: string,
    ): Promise<Expense[]>;
}

const MAX_EXPENSES_PER_PAGE = 20;

export class ExpenseInMemoryRepository implements ExpenseRepository {
    protected expenses: Array<Expense> = [];

    async getActorContactExpenseById(
        actorId: string,
        contactId: string,
        expenseId: string,
    ): Promise<Expense | null> {
        const expense = this.expenses
            .filter(this.isExpenseOf(actorId, contactId))
            .find(this.expenseMatches(expenseId));

        return expense ?? null;
    }

    async getActorContactExpenses(
        actorId: string,
        contactId: string,
        pageIndex: number,
        search: string,
    ): Promise<Expense[]> {
        const start = pageIndex * MAX_EXPENSES_PER_PAGE;
        return this.expenses
            .filter(this.isExpenseOf(actorId, contactId))
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
    ): Promise<Expense | null> {
        const expense = this.expenses
            .filter(this.isExpenseFrom(groupId))
            .filter(this.isExpenseOf(actorId))
            .find(this.expenseMatches(expenseId));

        return expense ?? null;
    }

    async getActorGroupExpenses(
        actorId: string,
        groupId: string,
        pageIndex: number,
        search: string,
    ): Promise<Expense[]> {
        const start = pageIndex * MAX_EXPENSES_PER_PAGE;
        return this.expenses
            .filter(this.isExpenseFrom(groupId))
            .filter(this.isExpenseOf(actorId))
            .filter(this.expenseLabelMatches(search))
            .slice(start, start + MAX_EXPENSES_PER_PAGE);
    }

    private expenseMatches(expenseId: string): (expense: Expense) => boolean {
        return (expense) => expense.getId() === expenseId;
    }

    private isExpenseOf(
        actorId: string,
        contactId?: string,
    ): (expense: Expense) => boolean {
        return (expense) => {
            return contactId
                ? expense.involvesStakeholder(actorId) &&
                      expense.involvesStakeholder(contactId)
                : expense.involvesStakeholder(actorId);
        };
    }

    private isExpenseFrom(groupId: string): (expense: Expense) => boolean {
        return (expense: Expense) => expense.involvesGroup(groupId);
    }

    private expenseLabelMatches(search: string): (expense: Expense) => boolean {
        const lowercasedSearch = search.toLowerCase();
        return (expense) =>
            expense.getLabel().toLowerCase().includes(lowercasedSearch);
    }
}
