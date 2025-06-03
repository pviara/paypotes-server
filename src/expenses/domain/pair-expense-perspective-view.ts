import { PairExpense } from '@expenses/domain/pair-expense';
import { ShareCalculator } from '@expenses/domain/share-calculator';

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
        const balance = new ShareCalculator(this.expense).calculateFor(
            this.perspectiveId,
        );
        return this.expense.cloneUsing(balance);
    }
}
