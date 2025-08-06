import { Expense } from '@expenses/domain/expense/expense';

type CalculatePosition = {
    expense: Expense;
    stakeholderId: string;
};

/**
 * Represents the financial position of a stakeholder in a specific expense.
 *
 * When given stakeholder is creditor, their `Position` is the total
 * amount that other stakeholders still owe them. Otherwise when they
 * are debtor, their `Position` is their fair share.
 *
 * **example:**
 * in a $30 expense split between 3 people, if Alice paid $20, her
 * position is +20, while Bob and Charlie each have a Position of -10.
 */
export class Position {
    constructor(private value: number) {}

    static calculate({ expense, stakeholderId }: CalculatePosition): number {
        const share = expense.getShareOf(stakeholderId);
        const position = expense.hasCreditor(stakeholderId) ? share : -share;
        return new Position(position).value;
    }
}
