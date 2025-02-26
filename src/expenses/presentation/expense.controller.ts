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

export const EXPENSES_API_ROUTE = 'expenses';

const ExpenseId = () => Param('id', ParseUUIDPipe);

@AuthGuard()
@Controller(EXPENSES_API_ROUTE)
export class ExpenseController {
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
    async getActorExpenses(): Promise<unknown[]> {
        return [];
    }
}
