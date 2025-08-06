import { PairExpense } from '@expenses/domain/expense/pair/pair-expense';
import { Position } from '@expenses/domain/balance/position';
import { Stakeholder } from '@expenses/domain/stakeholder/stakeholder';

type CreatePairExpenseSnapshot = {
    expense: PairExpense;
    perspectiveId: string;
};

export class PairExpenseSnapshot {
    private constructor(
        private expense: PairExpense,
        private perspectiveBalance: number,
        private perspectiveCounterparty: Stakeholder,
    ) {}

    static create({
        expense,
        perspectiveId,
    }: CreatePairExpenseSnapshot): PairExpenseSnapshot {
        const perspectiveBalance = Position.calculate({
            expense,
            stakeholderId: perspectiveId,
        });

        const perspectiveCounterparty =
            expense.getCounterpartyOf(perspectiveId);

        return new PairExpenseSnapshot(
            expense,
            perspectiveBalance,
            perspectiveCounterparty,
        );
    }

    getPerspectiveCounterparty(): Stakeholder {
        return this.perspectiveCounterparty;
    }

    getExpense(): PairExpense {
        return this.expense;
    }

    getPerspectiveBalance(): number {
        return this.perspectiveBalance;
    }
}

type CreatePairExpenseSnapshots = {
    expenses: Array<PairExpense>;
    perspectiveId: string;
};

export class PairExpenseSnapshots {
    private constructor(private value: Array<PairExpenseSnapshot>) {}

    static create({
        expenses,
        perspectiveId,
    }: CreatePairExpenseSnapshots): Array<PairExpenseSnapshot> {
        const snapshots = expenses.map((expense) =>
            PairExpenseSnapshot.create({
                expense,
                perspectiveId,
            }),
        );
        return new PairExpenseSnapshots(snapshots).value;
    }
}
