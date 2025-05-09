import { Actor, ActorId } from '@test/doubles/auth/actor.decorator';
import { AddGroupExpenseCommand } from '@expenses/application/commands/add-group-expense.handler';
import { AddGroupExpenseDTO } from '@expenses/presentation/dto/add-group-expense.dto';
import { AddPairExpenseCommand } from '@expenses/application/commands/add-pair-expense.handler';
import { AddPairExpenseDTO } from '@expenses/presentation/dto/add-pair-expense.dto';
import { AuthGuard } from '@auth/auth-guard.decorator';
import { BalanceDTO } from '@app/shared/dto/balance.dto';
import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseUUIDPipe,
    Post,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ComputeActorBalanceQuery } from '@expenses/application/queries/compute-actor-balance.handler';
import { Expense } from '@expenses/domain/expense';
import { ExpenseDTO } from '@expenses/presentation/dto/expense.dto';
import { GetActorContactExpenseByIdQuery } from '@expenses/application/queries/get-actor-contact-expense-by-id.handler';
import { GetActorExpenseByIdQuery } from '@expenses/application/queries/get-actor-expense-by-id.handler';
import { GetActorExpensesQuery } from '@expenses/application/queries/get-actor-expenses.handler';
import { GetActorGroupExpenseByIdQuery } from '@expenses/application/queries/get-actor-group-expense-by-id.handler';
import { GroupExpense } from '@expenses/domain/group-expense';
import { GroupExpenseDTO } from '@expenses/presentation/dto/group-expense.dto';
import { PageIndex } from '@app/shared/decorators/page-index.query-decorator';
import { PairExpense } from '@expenses/domain/pair-expense';
import { PairExpenseDTO } from '@expenses/presentation/dto/pair-expense.dto';
import { PaybackExpenseCommand } from '@expenses/application/commands/payback-expense.handler';
import { Search } from '@app/shared/decorators/search.query-decorator';
import { User } from '@users/domain/user';

export const EXPENSES_API_ROUTE = 'expenses';

const ContactId = () => Param('contactId', ParseUUIDPipe);
const ExpenseId = () => Param('expenseId', ParseUUIDPipe);
const GroupId = () => Param('groupId', ParseUUIDPipe);

@AuthGuard()
@Controller(EXPENSES_API_ROUTE)
export class ExpenseController {
    constructor(
        private commandBus: CommandBus,
        private queryBus: QueryBus,
    ) {}

    @Post('group')
    addGroupExpense(
        @ActorId() actorId: string,
        @Body() expense: AddGroupExpenseDTO,
    ): Promise<void> {
        const command = new AddGroupExpenseCommand({
            actorId,
            id: expense.id,
            label: expense.label,
            emoji: expense.emoji,
            balance: expense.balance,
            groupId: expense.groupId,
            memberId: expense.memberId,
        });
        return this.commandBus.execute(command);
    }

    @Post('pair')
    addPairExpense(
        @Actor() actor: User,
        @Body() expense: AddPairExpenseDTO,
    ): Promise<void> {
        const command = new AddPairExpenseCommand({
            actor,
            id: expense.id,
            label: expense.label,
            emoji: expense.emoji,
            balance: expense.balance,
            isCurrentPayer: expense.isCurrentPayer,
            userId: expense.userId,
        });
        return this.commandBus.execute(command);
    }

    @Get('balance')
    async computeActorBalance(@ActorId() actorId: string): Promise<string> {
        const query = new ComputeActorBalanceQuery({
            actorId,
        });
        const balance = await this.queryBus.execute(query);
        return BalanceDTO.from(balance).getValue();
    }

    @Get('contact/:contactId/expense/:expenseId')
    async getActorContactExpenseById(
        @ActorId() actorId: string,
        @ContactId() contactId: string,
        @ExpenseId() expenseId: string,
    ): Promise<PairExpenseDTO> {
        const query = new GetActorContactExpenseByIdQuery({
            actorId,
            contactId,
            expenseId,
        });
        const expense = await this.queryBus.execute(query);
        return PairExpenseDTO.from(expense);
    }

    @Get(':expenseId')
    async getActorExpenseById(
        @ActorId() actorId: string,
        @ExpenseId() expenseId: string,
    ): Promise<ExpenseDTO> {
        const query = new GetActorExpenseByIdQuery({
            actorId,
            expenseId,
        });
        const expense = await this.queryBus.execute(query);
        if (expense instanceof PairExpense) {
            return PairExpenseDTO.from(expense);
        } else if (expense instanceof GroupExpense) {
            return GroupExpenseDTO.from(expense);
        }
        throw new Error();
    }

    @Get()
    async getActorExpenses(
        @ActorId() actorId: string,
        @PageIndex() pageIndex: number,
        @Search() search: string,
    ): Promise<ExpenseDTO[]> {
        const query = new GetActorExpensesQuery({
            actorId,
            pageIndex,
            search,
        });
        const expenses = await this.queryBus.execute(query);
        return expenses.map((expense: Expense) => {
            if (expense instanceof PairExpense) {
                return PairExpenseDTO.from(expense);
            } else if (expense instanceof GroupExpense) {
                return GroupExpenseDTO.from(expense);
            }
        });
    }

    @Get('group/:groupId/expense/:expenseId')
    async getActorGroupExpenseById(
        @ActorId() actorId: string,
        @GroupId() groupId: string,
        @ExpenseId() expenseId: string,
    ): Promise<GroupExpenseDTO> {
        const query = new GetActorGroupExpenseByIdQuery({
            actorId,
            groupId,
            expenseId,
        });
        const expense = await this.queryBus.execute(query);
        return GroupExpenseDTO.from(expense);
    }

    @Delete(':expenseId')
    payback(
        @ActorId() actorId: string,
        @ExpenseId() expenseId: string,
    ): Promise<void> {
        const command = new PaybackExpenseCommand({ actorId, expenseId });
        return this.commandBus.execute(command);
    }
}
