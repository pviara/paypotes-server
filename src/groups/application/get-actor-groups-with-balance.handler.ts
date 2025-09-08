import { Expense } from '@expenses/domain/expense/expense';
import {
    ExpenseRepository,
    ExpensesByGroup,
} from '@expenses/persistence/expense.repository';
import { expenseRepositoryToken } from '@expenses/persistence/expense.repository-provider';
import { Group } from '@groups/domain/group';
import { GroupRepository } from '@groups/persistence/group.repository';
import { groupRepositoryToken } from '@groups/persistence/group.repository-provider';
import { GroupWithBalance } from '@groups/domain/group-with-balance';
import { Inject, Scope } from '@nestjs/common';
import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Log } from '@infra/logger/log.decorator';

export class GetActorGroupsWithBalanceQuery implements IQuery {
    constructor(
        readonly payload: {
            actorId: string;
            pageIndex: number;
            search: string;
        },
    ) {}
}

@QueryHandler(GetActorGroupsWithBalanceQuery, { scope: Scope.REQUEST })
export class GetActorGroupsWithBalanceHandler
    implements IQueryHandler<GetActorGroupsWithBalanceQuery>
{
    private groups: Array<Group> = [];

    constructor(
        @Inject(groupRepositoryToken)
        private groupRepository: GroupRepository,

        @Inject(expenseRepositoryToken)
        private expenseRepository: ExpenseRepository,
    ) {}

    @Log('debug')
    async execute(
        query: GetActorGroupsWithBalanceQuery,
    ): Promise<GroupWithBalance[]> {
        const groups = await this.getGroupsUsing(query);

        const { actorId } = query.payload;
        const expensesByGroup =
            await this.expenseRepository.getAllActorGroupsExpenses(
                actorId,
                groups,
            );

        const result = this.mapToGroupsWithBalance(expensesByGroup, actorId);
        return result;
    }

    private async getGroupsUsing(query: GetActorGroupsWithBalanceQuery) {
        const { actorId, pageIndex, search } = query.payload;

        const groups = await this.groupRepository.getActorGroups(
            actorId,
            pageIndex,
            search,
        );
        this.groups = groups;
        return groups;
    }

    private mapToGroupsWithBalance(
        expensesByGroup: ExpensesByGroup,
        actorId: string,
    ): Array<GroupWithBalance> {
        if (this.areAllGroupsWithoutExpenses(expensesByGroup)) {
            return this.mapSavedGroupsToGroupsWithDefaultBalance(actorId);
        }

        return this.mapExpensesByGroupToGroupsWithBalance(
            expensesByGroup,
            actorId,
        );
    }

    private areAllGroupsWithoutExpenses(
        expensesByGroup: ExpensesByGroup,
    ): boolean {
        return Object.keys(expensesByGroup).length === 0;
    }

    private mapSavedGroupsToGroupsWithDefaultBalance(
        actorId: string,
    ): Array<GroupWithBalance> {
        return this.groups.map((group) =>
            this.buildGroupWithBalanceFrom(group.getId(), actorId),
        );
    }

    private buildGroupWithBalanceFrom(
        groupId: string,
        actorId: string,
        expenses: Array<Expense> = [],
    ): GroupWithBalance {
        return GroupWithBalance.from({
            group: this.getGroupFromSavedList(groupId),
            expenses,
            perspectiveId: actorId,
        });
    }

    private getGroupFromSavedList(groupId: string): Group {
        const contact = this.groups.find((group) => group.getId() === groupId);
        if (contact) return contact;
        throw new GroupNotFoundInSavedList(groupId);
    }

    private mapExpensesByGroupToGroupsWithBalance(
        expensesByGroup: ExpensesByGroup,
        actorId: string,
    ): Array<GroupWithBalance> {
        return Object.entries(expensesByGroup).map(([contactId, expenses]) =>
            this.buildGroupWithBalanceFrom(contactId, actorId, expenses),
        );
    }
}

export class GroupNotFoundInSavedList extends Error {
    constructor(groupId: string) {
        super(
            `Group with id "${groupId}" could not be found in saved list although it should have`,
        );
    }
}
