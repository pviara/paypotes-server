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

    getActorContactExpenseById(
        actorId: string,
        contactId: string,
        expenseId: string,
    ): Promise<Expense | null> {
        throw new Error('Method not implemented.');
    }

    getActorContactExpenses(
        actorId: string,
        contactId: string,
        pageIndex: number,
        search: string,
    ): Promise<Expense[]> {
        throw new Error('Method not implemented.');
    }

    getActorExpenseById(
        actorId: string,
        expenseId: string,
    ): Promise<Expense | null> {
        throw new Error('Method not implemented.');
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

    private isExpenseOf(actorId: string): (expense: Expense) => boolean {
        return (expense) => expense.involves(actorId);
    }

    private expenseLabelMatches(search: string): (expense: Expense) => boolean {
        const lowercasedSearch = search.toLowerCase();
        return (expense) =>
            expense.getLabel().toLowerCase().includes(lowercasedSearch);
    }

    getActorGroupExpenseById(
        actorId: string,
        groupId: string,
        expenseId: string,
    ): Promise<Expense | null> {
        throw new Error('Method not implemented.');
    }

    getActorGroupExpenses(
        actorId: string,
        groupId: string,
        pageIndex: number,
        search: string,
    ): Promise<Expense[]> {
        throw new Error('Method not implemented.');
    }
}
