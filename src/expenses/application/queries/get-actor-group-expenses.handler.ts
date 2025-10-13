import { ExpenseRepository } from '@expenses/persistence/expense.repository';
import { expenseRepositoryToken } from '@expenses/persistence/expense.repository-provider';
import {
    GroupExpenseSnapshot,
    GroupExpenseSnapshots,
} from '@expenses/domain/expense/group/group-expense-snapshot';
import { GroupNotFoundError } from '@groups/application/get-actor-group-with-balance-by-id.handler';
import { GroupRepository } from '@groups/persistence/group.repository';
import { Inject } from '@nestjs/common';
import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Log } from '@infra/logger/log.decorator';

export class GetActorGroupExpensesQuery implements IQuery {
    constructor(
        readonly payload: {
            actorId: string;
            groupId: string;
            pageIndex: number;
            search: string;
        },
    ) {}
}

@QueryHandler(GetActorGroupExpensesQuery)
export class GetActorGroupExpensesHandler
    implements IQueryHandler<GetActorGroupExpensesQuery>
{
    constructor(
        @Inject(expenseRepositoryToken)
        private expenseRepository: ExpenseRepository,

        private groupRepository: GroupRepository,
    ) {}

    @Log('debug')
    async execute(
        query: GetActorGroupExpensesQuery,
    ): Promise<GroupExpenseSnapshot[]> {
        const { actorId, groupId, pageIndex, search } = query.payload;

        const group = await this.newMethod(actorId, groupId);
        if (group) {
            const expenses = await this.expenseRepository.getActorGroupExpenses(
                actorId,
                group,
                pageIndex,
                search,
            );
            return GroupExpenseSnapshots.create({
                expenses,
                perspectiveId: actorId,
            });
        }
        throw new GroupNotFoundError(groupId);
    }

    private async newMethod(actorId: string, groupId: string) {
        return await this.groupRepository.getActorGroupById(actorId, groupId);
    }
}
