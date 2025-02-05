import { CqrsModule } from '@nestjs/cqrs';
import { CreateGroupHandler } from '@groups/application/create-group.handler';
import { GroupController } from '@groups/presentation/group.controller';
import { groupRepositoryProvider } from '@groups/persistence/group.repository-provider';
import { Module } from '@nestjs/common';
import { UserModule } from '@users/user.module';

@Module({
    controllers: [GroupController],
    imports: [CqrsModule, UserModule],
    providers: [CreateGroupHandler, groupRepositoryProvider],
})
export class GroupModule {}
