import { AsyncLocalStorage } from 'async_hooks';
import { asyncLocalStorageProvider } from '@infra/async-local-storage/async-local-storage.provider';
import { Global, Module } from '@nestjs/common';

@Global()
@Module({
    exports: [AsyncLocalStorage],
    providers: [asyncLocalStorageProvider],
})
export class AsyncLocalStorageModule {}
