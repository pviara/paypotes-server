import { GroupModule } from '@groups/group.module';
import { Module } from '@nestjs/common';

@Module({
    imports: [GroupModule],
})
export class AppModule {}
