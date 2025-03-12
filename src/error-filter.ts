import { Catch, ExceptionFilter, NotFoundException } from '@nestjs/common';
import { ContactNotFoundError } from '@contacts/application/get-actor-contact-by-id.handler';
import { ExpenseNotFoundError } from '@expenses/application/get-actor-expense-by-id.handler';
import { GroupNotFoundError } from '@groups/application/get-actor-group-by-id.handler';
import { MemberNotFoundError } from '@groups/application/create-group.handler';
import { ContactExpenseNotFoundError } from './expenses/application/get-actor-contact-expense-by-id.handler';
import { GroupExpenseNotFoundError } from './expenses/application/get-actor-group-expense-by-id.handler';

@Catch(Error)
export class ErrorFilter implements ExceptionFilter {
    catch(exception: Error): void {
        if (exception instanceof MemberNotFoundError) {
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
        throw exception;
    }
}
