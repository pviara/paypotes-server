import { ExpenseRepository } from '@expenses/persistence/expense.repository';
import { expenseRepositoryToken } from '@expenses/persistence/expense.repository-provider';
import { Group } from '@groups/domain/group';
import { GroupRepository } from '@groups/persistence/group.repository';
import { groupRepositoryToken } from '@groups/persistence/group.repository-provider';
import { GroupWithBalance } from '@groups/domain/group-with-balance';
import { Inject } from '@nestjs/common';
import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';

export class GetActorGroupWithBalanceByIdQuery implements IQuery {
    constructor(
        readonly payload: {
            actorId: string;
            groupId: string;
        },
    ) {}
}

@QueryHandler(GetActorGroupWithBalanceByIdQuery)
export class GetActorGroupWithBalanceByIdHandler
    implements IQueryHandler<GetActorGroupWithBalanceByIdQuery>
{
    constructor(
        @Inject(groupRepositoryToken)
        private groupRepository: GroupRepository,

        @Inject(expenseRepositoryToken)
        private expenseRepository: ExpenseRepository,
    ) {}

    async execute(
        query: GetActorGroupWithBalanceByIdQuery,
    ): Promise<GroupWithBalance> {
        const group = await this.getGroupUsing(query);

        const { actorId } = query.payload;
        const expenses = await this.expenseRepository.getAllActorGroupExpenses(
            actorId,
            group.getId(),
        );

        return GroupWithBalance.from({
            group,
            expenses,
            perspectiveId: actorId,
        });
    }

    private async getGroupUsing(
        query: GetActorGroupWithBalanceByIdQuery,
    ): Promise<Group> {
        const { actorId, groupId } = query.payload;
        const contact = await this.groupRepository.getActorGroupById(
            actorId,
            groupId,
        );

        if (contact) return contact;
        throw new GroupNotFoundError(groupId);
    }
}

export class GroupNotFoundError extends Error {
    constructor(id: string) {
        super(`Group with id '${id}' cannot be found`);
    }
}
