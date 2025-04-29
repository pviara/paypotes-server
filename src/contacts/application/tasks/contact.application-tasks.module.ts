import { AddRelationshipBetweenUsersHandler } from '@contacts/application/tasks/add-relationship-between-users.handler';
import { CqrsModule } from '@nestjs/cqrs';
import { Module } from '@nestjs/common';

@Module({
    imports: [CqrsModule],
    providers: [AddRelationshipBetweenUsersHandler],
})
export class ContactApplicationTasksModule {}
