import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
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
import { Response } from 'express';

@Catch(Error)
export class ErrorFilter implements ExceptionFilter {
    catch(exception: Error, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        if (exception instanceof HttpException) {
            response
                .status(exception.getStatus())
                .send({ error: exception.message });
        } else if (exception instanceof GroupUserNotFoundError) {
            response
                .status(HttpStatus.NOT_FOUND)
                .json({ error: exception.message });
        } else if (exception instanceof GroupNotFoundError) {
            response
                .status(HttpStatus.NOT_FOUND)
                .json({ error: exception.message });
        } else if (exception instanceof ContactNotFoundError) {
            response
                .status(HttpStatus.NOT_FOUND)
                .json({ error: exception.message });
        } else if (exception instanceof ContactNotFoundInSavedList) {
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                error: exception.message,
            });
        } else if (exception instanceof ExpenseNotFoundError) {
            response
                .status(HttpStatus.NOT_FOUND)
                .json({ error: exception.message });
        } else if (exception instanceof ExpenseUserNotFoundError) {
            response
                .status(HttpStatus.NOT_FOUND)
                .json({ error: exception.message });
        } else if (exception instanceof ContactExpenseNotFoundError) {
            response
                .status(HttpStatus.NOT_FOUND)
                .json({ error: exception.message });
        } else if (exception instanceof GroupExpenseNotFoundError) {
            response
                .status(HttpStatus.NOT_FOUND)
                .json({ error: exception.message });
        } else if (exception instanceof MemberNotInGroupError) {
            response
                .status(HttpStatus.NOT_FOUND)
                .json({ error: exception.message });
        }
    }
}
