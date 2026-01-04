import { AsyncLocalStorage } from 'async_hooks';
import { Provider } from '@nestjs/common';
import { Store } from '@infra/async-local-storage/store';

export const asyncLocalStorageProvider: Provider = {
    provide: AsyncLocalStorage,
    useValue: new AsyncLocalStorage<Store>(),
};
