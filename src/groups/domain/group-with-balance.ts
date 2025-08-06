import { Balance } from '@expenses/domain/balance/balance';
import { Expense } from '@expenses/domain/expense/expense';
import { Group } from '@groups/domain/group';
import { Member } from '@groups/domain/member';

export class GroupWithBalance extends Group {
    private balance: number = 0;

    constructor(
        protected data: {
            id: string;
            name: string;
            emoji: string;
            members: Array<Member>;
            expenses: Array<Expense>;
            perspectiveId: string;
        },
    ) {
        super({
            id: data.id,
            name: data.name,
            emoji: data.emoji,
            members: data.members,
        });
        this.balance = this.calcBalanceFor(data.perspectiveId);
    }

    static from(data: {
        group: Group;
        expenses: Array<Expense>;
        perspectiveId: string;
    }): GroupWithBalance {
        return new GroupWithBalance({
            id: data.group.getId(),
            name: data.group.getName(),
            emoji: data.group.getEmoji(),
            members: data.group.getMembers(),
            expenses: data.expenses,
            perspectiveId: data.perspectiveId,
        });
    }

    getBalance(): number {
        return this.balance;
    }

    private calcBalanceFor(stakeholderId: string): number {
        const expenses = this.getExpenses();
        return Balance.calculate({
            expenses,
            stakeholderId,
        });
    }

    private getExpenses(): Array<Expense> {
        return this.data.expenses;
    }
}
