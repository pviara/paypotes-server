import { GroupExpense } from '@expenses/domain/group-expense';
import { ShareCalculator } from '@expenses/domain/share-calculator';

export class GroupExpensePerspectiveView {
    private view = this.getGroupExpenseView();

    private constructor(
        private expense: GroupExpense,
        private perspectiveId: string,
    ) {}

    static from(expense: GroupExpense, perspectiveId: string): GroupExpense {
        return new GroupExpensePerspectiveView(expense, perspectiveId).view;
    }

    private getGroupExpenseView(): GroupExpense {
        const balance = new ShareCalculator(this.expense).calculateFor(
            this.perspectiveId,
        );
        return this.expense.cloneUsing(balance);
    }
}
