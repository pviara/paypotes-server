import { Expense } from '@expenses/domain/expense';

export interface ExpenseRepository {
    getActorExpenses(actorId: string, search: string): Promise<Expense[]>;
    getActorExpenseById(
        actorId: string,
        expenseId: string,
    ): Promise<Expense | null>;
}

export class ExpenseInMemoryRepository implements ExpenseRepository {
    getActorExpenses(actorId: string, search: string): Promise<Expense[]> {
        throw new Error('Method not implemented.');
    }
    getActorExpenseById(
        actorId: string,
        expenseId: string,
    ): Promise<Expense | null> {
        throw new Error('Method not implemented.');
    }
}
