import { ConfigService } from '@nestjs/config';

export class ConfigServiceStub extends ConfigService {
    readonly dummyQueue = 'queue';

    override get(key: string): string {
        return this.dummyQueue;
    }
}
