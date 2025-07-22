import { Actor, ActorId } from '@auth/presentation/model/actor.decorator';
import { AddGroupExpenseCommand } from '@expenses/application/commands/add-group-expense.handler';
import { AddGroupExpenseDTO } from '@expenses/presentation/dto/add-group-expense.dto';
import { AddPairExpenseCommand } from '@expenses/application/commands/add-pair-expense.handler';
import { AddPairExpenseDTO } from '@expenses/presentation/dto/add-pair-expense.dto';
import { AuthGuard } from '@auth/auth-guard.decorator';
import { BalanceDTO } from '@app/shared/dto/balance.dto';
import {
    Body,
    Controller,
    Get,
    Param,
    ParseUUIDPipe,
    Post,
    Put,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ComputeActorBalanceQuery } from '@expenses/application/queries/compute-actor-balance.handler';
import { Expense } from '@expenses/domain/expense';
import { ExpenseDTO } from '@expenses/presentation/dto/expense.dto';
import { GetActorContactExpenseByIdQuery } from '@expenses/application/queries/get-actor-contact-expense-by-id.handler';
import { GetActorContactExpensesQuery } from '@expenses/application/queries/get-actor-contact-expenses.handler';
import { GetActorExpenseByIdQuery } from '@expenses/application/queries/get-actor-expense-by-id.handler';
import { GetActorExpensesQuery } from '@expenses/application/queries/get-actor-expenses.handler';
import { GetActorGroupExpenseByIdQuery } from '@expenses/application/queries/get-actor-group-expense-by-id.handler';
import { GetActorGroupExpensesQuery } from '@expenses/application/queries/get-actor-group-expenses.handler';
import { GroupExpenseDTO } from '@expenses/presentation/dto/group-expense.dto';
import { GroupExpenseSnapshot } from '@expenses/domain/group-expense/group-expense-snapshot';
import { PageIndex } from '@app/shared/decorators/page-index.query-decorator';
import { PairExpenseDTO } from '@expenses/presentation/dto/pair-expense.dto';
import { PairExpenseSnapshot } from '@expenses/domain/pair-expense/pair-expense-snapshot';
import { PaybackGroupExpenseCommand } from '@expenses/application/commands/payback-group-expense.handler';
import { PaybackGroupExpenseDTO } from '@expenses/presentation/dto/payback-group-expense.dto';
import { PaybackPairExpenseCommand } from '@expenses/application/commands/payback-pair-expense.handler';
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

    @Get('contact/:contactId')
    async getActorContactExpenses(
        @ActorId() actorId: string,
        @ContactId() contactId: string,
        @PageIndex() pageIndex: number,
        @Search() search: string,
    ): Promise<PairExpenseDTO[]> {
        const query = new GetActorContactExpensesQuery({
            actorId,
            contactId,
            pageIndex,
            search,
        });
        const expenses = await this.queryBus.execute(query);
        return expenses.map((expense: PairExpenseSnapshot) =>
            PairExpenseDTO.from(expense),
        );
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
        if (expense instanceof PairExpenseSnapshot) {
            return PairExpenseDTO.from(expense);
        } else if (expense instanceof GroupExpenseSnapshot) {
            return GroupExpenseDTO.from(expense);
        }
        throw new Error(); // todo -> change this
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
            if (expense instanceof PairExpenseSnapshot) {
                return PairExpenseDTO.from(expense);
            } else if (expense instanceof GroupExpenseSnapshot) {
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

    @Get('group/:groupId')
    async getActorGroupExpenses(
        @ActorId() actorId: string,
        @GroupId() groupId: string,
        @PageIndex() pageIndex: number,
        @Search() search: string,
    ): Promise<GroupExpenseDTO[]> {
        const query = new GetActorGroupExpensesQuery({
            actorId,
            groupId,
            pageIndex,
            search,
        });
        const expenses = await this.queryBus.execute(query);
        return expenses.map((expense: GroupExpenseSnapshot) =>
            GroupExpenseDTO.from(expense),
        );
    }

    @Put('group/:groupId/:expenseId')
    paybackGroupExpense(
        @ActorId() actorId: string,
        @GroupId() groupId: string,
        @ExpenseId() expenseId: string,
        @Body() payback: PaybackGroupExpenseDTO,
    ): Promise<void> {
        const { debtorIds } = payback;
        const command = new PaybackGroupExpenseCommand({
            actorId,
            expenseId,
            groupId,
            debtorIds,
        });
        return this.commandBus.execute(command);
    }

    @Put('pair/:contactId/:expenseId')
    paybackPairExpense(
        @ActorId() actorId: string,
        @ContactId() contactId: string,
        @ExpenseId() expenseId: string,
    ): Promise<void> {
        const command = new PaybackPairExpenseCommand({
            actorId,
            contactId,
            expenseId,
        });
        return this.commandBus.execute(command);
    }
}
