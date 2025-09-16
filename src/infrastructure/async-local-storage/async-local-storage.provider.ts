import { AsyncLocalStorage } from 'async_hooks';
import { Provider } from '@nestjs/common';

export const asyncLocalStorageProvider: Provider = {
    provide: AsyncLocalStorage,
    useValue: new AsyncLocalStorage(),
};
