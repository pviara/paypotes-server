import { InjectionToken, Type } from '@nestjs/common';

type OverriddenToken = {
    provide: InjectionToken;
};

export type OverridingClassProvider = OverriddenToken & {
    useClass: Type;
};

export type OverridingValueProvider = OverriddenToken & {
    useValue: Record<string, any>;
};

export type OverridingProvider =
    | OverridingClassProvider
    | OverridingValueProvider;
export type OverridingProviders = OverridingProvider[];

export function isClassProvider(
    provider: OverridingProvider,
): provider is OverridingClassProvider {
    return provider.hasOwnProperty('useClass');
}

export function isValueProvider(
    provider: OverridingProvider,
): provider is OverridingValueProvider {
    return provider.hasOwnProperty('useValue');
}
