import { AddRelationshipsBetweenUsersHandler } from '@app/contacts/application/tasks/add-relationships-between-users.handler';
import { ContactRepositoryModule } from '@contacts/persistence/contact.repository-module';
import { CqrsModule } from '@nestjs/cqrs';
import { Module } from '@nestjs/common';
import { UserRepositoryModule } from '@users/persistence/user.repository-module';

@Module({
    imports: [ContactRepositoryModule, CqrsModule, UserRepositoryModule],
    providers: [AddRelationshipsBetweenUsersHandler],
})
export class ContactApplicationTasksModule {}
