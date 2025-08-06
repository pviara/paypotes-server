import { Expense } from '@expenses/domain/expense/expense';
import { Position } from '@expenses/domain/balance/position';
import { ZERO } from '@app/shared/zero';

type CalculateBalance = {
    expenses: Array<Expense>;
    stakeholderId: string;
};

/**
 * Represents the total financial position of a stakeholder across multiple expenses.
 */
export class Balance {
    private constructor(private value: number) {}

    static calculate({ expenses, stakeholderId }: CalculateBalance): number {
        const balance = expenses.reduce(
            this.calculateExpenseBalanceFor(stakeholderId),
            ZERO,
        );
        return new Balance(balance).value;
    }

    private static calculateExpenseBalanceFor(
        stakeholderId: string,
    ): (balance: number, expense: Expense) => number {
        return (balance, expense) => {
            return balance + Position.calculate({ expense, stakeholderId });
        };
    }
}
