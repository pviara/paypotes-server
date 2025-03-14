import { Catch, ExceptionFilter, NotFoundException } from '@nestjs/common';
import { ContactExpenseNotFoundError } from '@expenses/application/queries/get-actor-contact-expense-by-id.handler';
import { ContactNotFoundError } from '@contacts/application/get-actor-contact-by-id.handler';
import { ExpenseNotFoundError } from '@expenses/application/queries/get-actor-expense-by-id.handler';
import { GroupExpenseNotFoundError } from '@expenses/application/queries/get-actor-group-expense-by-id.handler';
import { GroupNotFoundError } from '@groups/application/get-actor-group-by-id.handler';
import { MemberNotInGroupError } from '@groups/domain/group';
import { UserExpenseNotFoundError } from '@expenses/application/commands/add-pair-expense.handler';
import { UserNotFoundError } from '@groups/application/create-group.handler';

@Catch(Error)
export class ErrorFilter implements ExceptionFilter {
    catch(exception: Error): void {
        if (exception instanceof UserNotFoundError) {
            throw new NotFoundException();
        }
        if (exception instanceof GroupNotFoundError) {
            throw new NotFoundException();
        }
        if (exception instanceof ContactNotFoundError) {
            throw new NotFoundException();
        }
        if (exception instanceof ExpenseNotFoundError) {
            throw new NotFoundException();
        }
        if (exception instanceof ContactExpenseNotFoundError) {
            throw new NotFoundException();
        }
        if (exception instanceof GroupExpenseNotFoundError) {
            throw new NotFoundException();
        }
        if (exception instanceof UserExpenseNotFoundError) {
            throw new NotFoundException();
        }
        if (exception instanceof MemberNotInGroupError) {
            throw new NotFoundException();
        }
        throw exception;
    }
}
