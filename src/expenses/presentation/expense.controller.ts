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
import { GetActorExpensesQuery } from '@expenses/application/get-actor-expenses.handler';
import { PageIndex } from '@app/shared/decorators/page-index.query-decorator';
import { QueryBus } from '@nestjs/cqrs';
import { Search } from '@app/shared/decorators/search.query-decorator';
import { ExpenseDTO } from './dto/expense.dto';
import { Expense } from '../domain/expense';

export const EXPENSES_API_ROUTE = 'expenses';

const ExpenseId = () => Param('id', ParseUUIDPipe);

@AuthGuard()
@Controller(EXPENSES_API_ROUTE)
export class ExpenseController {
    constructor(private queryBus: QueryBus) {}

    @Post()
    async add(
        @ActorId() actorId: string,
        @Body() expense: AddExpenseDTO,
    ): Promise<void> {}

    @Get(':id')
    async getActorExpenseById(
        @ActorId() actorId: string,
        @ExpenseId() expenseId: string,
    ): Promise<unknown> {
        return;
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

    private mapDTOsFrom(expenses: any): Array<ExpenseDTO> {
        return expenses.map((expense: Expense) => ExpenseDTO.from(expense));
    }
}
