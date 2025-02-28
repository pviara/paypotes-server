import { Expense } from '@expenses/domain/expense';

export interface ExpenseRepository {
    getActorExpenses(actorId: string, search: string): Promise<Expense[]>;
    getActorExpenseById(
        actorId: string,
        expenseId: string,
    ): Promise<Expense | null>;
}
