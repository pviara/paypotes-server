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

export class PairExpenseSnapshots {
    private snapshots = this.mapPairExpenseSnapshots();

    private constructor(
        private expenses: Array<PairExpense>,
        private perspectiveId: string,
    ) {}

    static from(
        expenses: Array<PairExpense>,
        perspectiveId: string,
    ): Array<PairExpenseSnapshot> {
        return new PairExpenseSnapshots(expenses, perspectiveId).snapshots;
    }

    private mapPairExpenseSnapshots(): Array<PairExpenseSnapshot> {
        return this.expenses.map((expense) =>
            PairExpenseSnapshot.create({
                expense,
                perspectiveId: this.perspectiveId,
            }),
        );
    }
}
