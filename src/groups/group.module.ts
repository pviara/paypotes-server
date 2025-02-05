import { GroupController } from '@groups/presentation/group.controller';
import { Module } from '@nestjs/common';
import { UserModule } from '@users/user.module';

@Module({
    controllers: [GroupController],
    imports: [UserModule],
})
export class GroupModule {}
