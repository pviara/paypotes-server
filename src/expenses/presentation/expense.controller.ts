import { Actor, ActorId } from '@test/doubles/auth/actor.decorator';
import { AddPairExpenseDTO } from '@app/expenses/presentation/dto/add-pair-expense.dto';
import { AnyExpenseDTO } from '@expenses/presentation/dto/any-expense.dto';
import { AuthGuard } from '@auth/auth-guard.decorator';
import {
    Body,
    Controller,
    Get,
    Param,
    ParseUUIDPipe,
    Post,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Expense } from '@expenses/domain/expense';
import { GetActorContactExpenseByIdQuery } from '@expenses/application/get-actor-contact-expense-by-id.handler';
import { GetActorContactExpensesQuery } from '@expenses/application/get-actor-contact-expenses.handler';
import { GetActorExpenseByIdQuery } from '@expenses/application/get-actor-expense-by-id.handler';
import { GetActorExpensesQuery } from '@expenses/application/get-actor-expenses.handler';
import { GetActorGroupExpenseByIdQuery } from '@expenses/application/get-actor-group-expense-by-id.handler';
import { GetActorGroupExpensesQuery } from '@expenses/application/get-actor-group-expenses.handler';
import { GroupExpense } from '@expenses/domain/group-expense';
import { GroupExpenseDTO } from '@expenses/presentation/dto/group-expense.dto';
import { PageIndex } from '@app/shared/decorators/page-index.query-decorator';
import { PairExpense } from '@expenses/domain/pair-expense';
import { PairExpenseDTO } from '@expenses/presentation/dto/pair-expense.dto';
import { Search } from '@app/shared/decorators/search.query-decorator';
import { User } from '@app/users/domain/user';
import { AddPairExpenseCommand } from '../application/add-pair-expense.handler';

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

    @Post()
    async add(
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
        return this.mapPairExpenseDTOs(expenses);
    }

    @Get(':expenseId')
    async getActorExpenseById(
        @ActorId() actorId: string,
        @ExpenseId() expenseId: string,
    ): Promise<AnyExpenseDTO> {
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
    ): Promise<AnyExpenseDTO[]> {
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
    ): Promise<PairExpenseDTO> {
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
    ): Promise<PairExpenseDTO[]> {
        const query = new GetActorGroupExpensesQuery({
            actorId,
            groupId,
            pageIndex,
            search,
        });
        const expenses = await this.queryBus.execute(query);
        return this.mapGroupExpenseDTOs(expenses);
    }

    private mapPairExpenseDTOs(
        expenses: Array<PairExpense>,
    ): Array<PairExpenseDTO> {
        return expenses.map((expense: PairExpense) =>
            PairExpenseDTO.from(expense),
        );
    }

    private mapGroupExpenseDTOs(
        expenses: Array<GroupExpense>,
    ): Array<GroupExpenseDTO> {
        return expenses.map((expense: GroupExpense) =>
            GroupExpenseDTO.from(expense),
        );
    }
}
