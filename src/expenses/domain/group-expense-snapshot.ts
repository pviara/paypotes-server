import { GroupExpense } from '@expenses/domain/group-expense';
import { ShareCalculator } from '@expenses/domain/share-calculator';

export class GroupExpenseSnapshot {
    private perspectiveBalance = this.calculatePerspectiveBalance();

    private constructor(
        private expense: GroupExpense,
        private perspectiveId: string,
    ) {}

    static from(
        expense: GroupExpense,
        perspectiveId: string,
    ): GroupExpenseSnapshot {
        return new GroupExpenseSnapshot(expense, perspectiveId);
    }

    getExpense(): GroupExpense {
        return this.expense;
    }

    getPerspectiveBalance(): number {
        return this.perspectiveBalance;
    }

    private calculatePerspectiveBalance(): number {
        return new ShareCalculator(this.expense).calculateFor(
            this.perspectiveId,
        );
    }
}

export class GroupExpenseSnapshots {
    private snapshots = this.mapGroupExpenseSnapshots();

    private constructor(
        private expenses: Array<GroupExpense>,
        private perspectiveId: string,
    ) {}

    static from(
        expenses: Array<GroupExpense>,
        perspectiveId: string,
    ): Array<GroupExpenseSnapshot> {
        return new GroupExpenseSnapshots(expenses, perspectiveId).snapshots;
    }

    private mapGroupExpenseSnapshots(): Array<GroupExpenseSnapshot> {
        return this.expenses.map((expense) =>
            GroupExpenseSnapshot.from(expense, this.perspectiveId),
        );
    }
}
