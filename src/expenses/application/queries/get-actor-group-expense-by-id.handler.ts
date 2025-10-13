import { ExpenseRepository } from '@expenses/persistence/expense.repository';
import { GroupExpenseSnapshot } from '@expenses/domain/expense/group/group-expense-snapshot';
import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Log } from '@infra/logger/log.decorator';

export class GetActorGroupExpenseByIdQuery implements IQuery {
    constructor(
        readonly payload: {
            actorId: string;
            groupId: string;
            expenseId: string;
        },
    ) {}
}

@QueryHandler(GetActorGroupExpenseByIdQuery)
export class GetActorGroupExpenseByIdHandler
    implements IQueryHandler<GetActorGroupExpenseByIdQuery>
{
    constructor(private expenseRepository: ExpenseRepository) {}

    @Log('debug')
    async execute(
        query: GetActorGroupExpenseByIdQuery,
    ): Promise<GroupExpenseSnapshot> {
        const { actorId, groupId, expenseId } = query.payload;
        const expense = await this.expenseRepository.getActorGroupExpenseById(
            actorId,
            groupId,
            expenseId,
        );

        if (expense)
            return GroupExpenseSnapshot.create({
                expense,
                perspectiveId: actorId,
            });
        throw new GroupExpenseNotFoundError(groupId, expenseId);
    }
}

export class GroupExpenseNotFoundError extends Error {
    constructor(groupId: string, expenseId: string) {
        super(
            `Expense with groupId '${groupId}' and expenseId '${expenseId}' cannot be found`,
        );
    }
}
