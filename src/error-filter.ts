import { Catch, ExceptionFilter, NotFoundException } from '@nestjs/common';
import { MemberNotFoundError } from '@groups/application/create-group.handler';

@Catch(Error)
export class ErrorFilter implements ExceptionFilter {
    catch(exception: Error): void {
        if (exception instanceof MemberNotFoundError) {
            throw new NotFoundException();
        }
        throw exception;
    }
}
