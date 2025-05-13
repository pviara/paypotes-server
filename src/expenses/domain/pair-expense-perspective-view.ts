import { PairExpense } from '@expenses/domain/pair-expense';

export class PairExpensePerspectiveView {
    private view = this.getPairExpenseView();

    private constructor(
        private expense: PairExpense,
        private perspectiveId: string,
    ) {}

    static from(expense: PairExpense, perspectiveId: string): PairExpense {
        return new PairExpensePerspectiveView(expense, perspectiveId).view;
    }

    private getPairExpenseView(): PairExpense {
        const balance = this.expense.getShareOf(this.perspectiveId);
        return this.expense.cloneUsing(balance);
    }
}
