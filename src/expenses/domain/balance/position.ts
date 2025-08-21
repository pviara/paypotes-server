import { Expense } from '@expenses/domain/expense/expense';

type CalculatePosition = {
    expense: Expense;
    stakeholderId: string;
};

/**
 * Represents the financial position of a stakeholder in a specific expense.
 */
export class Position {
    private constructor(private value: number) {}

    static calculate({ expense, stakeholderId }: CalculatePosition): number {
        const share = expense.getShareOf(stakeholderId);
        const position = expense.hasCreditor(stakeholderId) ? share : -share;
        return new Position(position).value;
    }
}
