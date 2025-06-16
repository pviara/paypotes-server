import { PairExpense } from '@expenses/domain/pair-expense';
import { ShareCalculator } from '@expenses/domain/share-calculator';

export class PairExpenseSnapshot {
    private perspectiveBalance = this.calculatePerspectiveBalance();

    private constructor(
        private expense: PairExpense,
        private perspectiveId: string,
    ) {}

    static from(
        expense: PairExpense,
        perspectiveId: string,
    ): PairExpenseSnapshot {
        return new PairExpenseSnapshot(expense, perspectiveId);
    }

    getExpense(): PairExpense {
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
            PairExpenseSnapshot.from(expense, this.perspectiveId),
        );
    }
}
