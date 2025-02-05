import { Module } from '@nestjs/common';
import { GroupModule } from '@groups/group.module';

@Module({
    imports: [GroupModule],
})
export class AppModule {}
