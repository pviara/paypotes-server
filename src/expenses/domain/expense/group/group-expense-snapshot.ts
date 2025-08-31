import { GroupExpense } from '@expenses/domain/expense/group/group-expense';
import { Position } from '@expenses/domain/balance/position';

type CreateGroupExpenseSnapshot = {
    expense: GroupExpense;
    perspectiveId: string;
};

export class GroupExpenseSnapshot {
    private constructor(
        private expense: GroupExpense,
        private perspectiveBalance: number,
    ) {}

    static create({
        expense,
        perspectiveId,
    }: CreateGroupExpenseSnapshot): GroupExpenseSnapshot {
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

type CreateGroupExpenseSnapshots = {
    expenses: Array<GroupExpense>;
    perspectiveId: string;
};

export class GroupExpenseSnapshots {
    private constructor(private value: Array<GroupExpenseSnapshot>) {}

    static create({
        expenses,
        perspectiveId,
    }: CreateGroupExpenseSnapshots): Array<GroupExpenseSnapshot> {
        const snapshots = expenses.map((expense) =>
            GroupExpenseSnapshot.create({
                expense,
                perspectiveId,
            }),
        );
        return new GroupExpenseSnapshots(snapshots).value;
    }
}
