import { ActorId } from '@test/doubles/auth/actor.decorator';
import { AddExpenseDTO } from '@expenses/presentation/dto/add-expense.dto';
import { AuthGuard } from '@auth/auth-guard.decorator';
import {
    Body,
    Controller,
    Get,
    Param,
    ParseUUIDPipe,
    Post,
} from '@nestjs/common';
import { SimpleExpense } from '@app/expenses/domain/simple-expense';
import { ExpenseDTO } from '@expenses/presentation/dto/expense.dto';
import { GetActorContactExpenseByIdQuery } from '@expenses/application/get-actor-contact-expense-by-id.handler';
import { GetActorContactExpensesQuery } from '@expenses/application/get-actor-contact-expenses.handler';
import { GetActorExpenseByIdQuery } from '@expenses/application/get-actor-expense-by-id.handler';
import { GetActorExpensesQuery } from '@expenses/application/get-actor-expenses.handler';
import { GetActorGroupExpenseByIdQuery } from '@expenses/application/get-actor-group-expense-by-id.handler';
import { PageIndex } from '@app/shared/decorators/page-index.query-decorator';
import { QueryBus } from '@nestjs/cqrs';
import { Search } from '@app/shared/decorators/search.query-decorator';
import { GetActorGroupExpensesQuery } from '@expenses/application/get-actor-group-expenses.handler';

export const EXPENSES_API_ROUTE = 'expenses';

const ContactId = () => Param('contactId', ParseUUIDPipe);
const ExpenseId = () => Param('expenseId', ParseUUIDPipe);
const GroupId = () => Param('groupId', ParseUUIDPipe);

@AuthGuard()
@Controller(EXPENSES_API_ROUTE)
export class ExpenseController {
    constructor(private queryBus: QueryBus) {}

    @Post()
    async add(
        @ActorId() actorId: string,
        @Body() expense: AddExpenseDTO,
    ): Promise<void> {}

    @Get('contact/:contactId/expense/:expenseId')
    async getActorContactExpenseById(
        @ActorId() actorId: string,
        @ContactId() contactId: string,
        @ExpenseId() expenseId: string,
    ): Promise<ExpenseDTO> {
        const query = new GetActorContactExpenseByIdQuery({
            actorId,
            contactId,
            expenseId,
        });
        const expense = await this.queryBus.execute(query);
        return ExpenseDTO.from(expense);
    }

    @Get('contact/:contactId')
    async getActorContactExpenses(
        @ActorId() actorId: string,
        @ContactId() contactId: string,
        @PageIndex() pageIndex: number,
        @Search() search: string,
    ): Promise<ExpenseDTO[]> {
        const query = new GetActorContactExpensesQuery({
            actorId,
            contactId,
            pageIndex,
            search,
        });
        const expenses = await this.queryBus.execute(query);
        return this.mapDTOsFrom(expenses);
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
        return ExpenseDTO.from(expense);
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
        return this.mapDTOsFrom(expenses);
    }

    @Get('group/:groupId/expense/:expenseId')
    async getActorGroupExpenseById(
        @ActorId() actorId: string,
        @GroupId() groupId: string,
        @ExpenseId() expenseId: string,
    ): Promise<ExpenseDTO> {
        const query = new GetActorGroupExpenseByIdQuery({
            actorId,
            groupId,
            expenseId,
        });
        const expense = await this.queryBus.execute(query);
        return ExpenseDTO.from(expense);
    }

    @Get('group/:groupId')
    async getActorGroupExpenses(
        @ActorId() actorId: string,
        @GroupId() groupId: string,
        @PageIndex() pageIndex: number,
        @Search() search: string,
    ): Promise<ExpenseDTO[]> {
        const query = new GetActorGroupExpensesQuery({
            actorId,
            groupId,
            pageIndex,
            search,
        });
        const expenses = await this.queryBus.execute(query);
        return this.mapDTOsFrom(expenses);
    }

    private mapDTOsFrom(expenses: any): Array<ExpenseDTO> {
        return expenses.map((expense: SimpleExpense) =>
            ExpenseDTO.from(expense),
        );
    }
}
