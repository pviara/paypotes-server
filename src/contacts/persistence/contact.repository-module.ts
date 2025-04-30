import { Module } from '@nestjs/common';
import {
    contactRepositoryProvider,
    contactRepositoryToken,
} from './contact.repository-provider';

@Module({
    exports: [contactRepositoryToken],
    providers: [contactRepositoryProvider],
})
export class ContactRepositoryModule {}
