import { GroupExpense } from '@expenses/domain/group-expense';

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
        const balance = this.expense.getShareOf(this.perspectiveId);
        return this.expense.cloneUsing(balance);
    }
}
