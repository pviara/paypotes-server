import {
    Catch,
    ExceptionFilter,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { ContactExpenseNotFoundError } from '@expenses/application/queries/get-actor-contact-expense-by-id.handler';
import { ContactNotFoundError } from '@contacts/application/get-actor-contact-with-balance-by-id.handler';
import { ExpenseNotFoundError } from '@expenses/application/queries/get-actor-expense-by-id.handler';
import { ExpenseUserNotFoundError } from '@expenses/application/commands/add-pair-expense.handler';
import { ContactNotFoundInSavedList } from '@contacts/application/get-actor-contacts-with-balance.handler';
import { GroupExpenseNotFoundError } from '@expenses/application/queries/get-actor-group-expense-by-id.handler';
import { GroupNotFoundError } from '@groups/application/get-actor-group-with-balance-by-id.handler';
import { GroupUserNotFoundError } from '@groups/application/create-group.handler';
import { MemberNotInGroupError } from '@groups/domain/group';

@Catch(Error)
export class ErrorFilter implements ExceptionFilter {
    catch(exception: Error): void {
        if (exception instanceof GroupUserNotFoundError) {
            throw new NotFoundException(exception.message);
        }
        if (exception instanceof GroupNotFoundError) {
            throw new NotFoundException(exception.message);
        }
        if (exception instanceof ContactNotFoundError) {
            throw new NotFoundException(exception.message);
        }
        if (exception instanceof ContactNotFoundInSavedList) {
            throw new InternalServerErrorException(exception.message);
        }
        if (exception instanceof ExpenseNotFoundError) {
            throw new NotFoundException(exception.message);
        }
        if (exception instanceof ExpenseUserNotFoundError) {
            throw new NotFoundException(exception.message);
        }
        if (exception instanceof ContactExpenseNotFoundError) {
            throw new NotFoundException(exception.message);
        }
        if (exception instanceof GroupExpenseNotFoundError) {
            throw new NotFoundException(exception.message);
        }
        if (exception instanceof MemberNotInGroupError) {
            throw new NotFoundException(exception.message);
        }
        throw exception;
    }
}
