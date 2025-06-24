import { ClassProvider, Provider, ValueProvider } from '@nestjs/common';

export function isClassProvider(provider: Provider): provider is ClassProvider {
    return provider.hasOwnProperty('useClass');
}

export function isValueProvider(provider: Provider): provider is ValueProvider {
    return provider.hasOwnProperty('useValue');
}
