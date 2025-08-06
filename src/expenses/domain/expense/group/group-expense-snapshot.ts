import { GroupExpense } from '@expenses/domain/expense/group/group-expense';
import { Position } from '@expenses/domain/balance/position';

export class GroupExpenseSnapshot {
    private constructor(
        private expense: GroupExpense,
        private perspectiveBalance: number,
    ) {}

    static create(
        expense: GroupExpense,
        perspectiveId: string,
    ): GroupExpenseSnapshot {
        const perspectiveBalance = Position.calculate({
            expense,
            stakeholderId: perspectiveId,
        });
        return new GroupExpenseSnapshot(expense, perspectiveBalance);
    }

    getExpense(): GroupExpense {
        return this.expense;
    }

    getPerspectiveBalance(): number {
        return this.perspectiveBalance;
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
            GroupExpenseSnapshot.create(expense, this.perspectiveId),
        );
    }
}
