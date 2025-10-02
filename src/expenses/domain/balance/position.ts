import { Expense } from '@expenses/domain/expense/expense';

type Terms = {
    expense: Expense;
    stakeholderId: string;
};

/**
 * Represents the financial position of a stakeholder in a specific expense.
 */
export class Position {
    private constructor(private value: number) {}

    static calculate({ expense, stakeholderId }: Terms): number {
        const share = expense.getShareOf(stakeholderId);
        const position = expense.hasCreditor(stakeholderId) ? share : -share;
        return new Position(position).value;
    }
}
