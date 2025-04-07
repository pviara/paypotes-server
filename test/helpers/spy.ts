type Stubs<T> = {
    [K in keyof T]: T[K] extends (...args: any[]) => infer R
        ? Awaited<R>
        : unknown;
};

type Calls<T> = {
    [K in keyof T]: {
        count: number;
        history: unknown[];
    };
};

type Throws<T> = Partial<{
    [K in keyof T]: {
        errorMessage: string;
        error?: Error;
    };
}>;

export class Spy<T, K extends keyof T = keyof T> {
    private EMPTY_ERROR_MESSAGE = '';

    private stubs = {} as Stubs<T>;
    private throwingMethods: Throws<T> = {};

    protected calls = {} as Calls<T>;

    makeThrow<K extends keyof T>(
        method: K,
        errorMessage = this.EMPTY_ERROR_MESSAGE,
        error?: Error,
    ): void {
        this.throwingMethods[method] = { errorMessage, error };
    }

    stub<K extends keyof T>(method: K, value: Stubs<T>[K]): void {
        this.stubs[method] = value;
    }

    protected getStubOrDefault<K extends keyof T>(
        method: K,
        value: Stubs<T>[K],
    ): Stubs<T>[K] {
        this.throwErrorIfThrowing(method);

        const stub = this.stubs[method];
        return typeof stub === 'boolean' ? stub : stub || value;
    }

    protected saveCall(method: K, history: unknown): void {
        const calls = this.calls[method] ?? {};

        calls.count = (calls.count ?? 0) + 1;

        calls.history ??= [];
        calls.history.push(history);

        this.calls[method] = calls;
    }

    private throwErrorIfThrowing<K extends keyof T>(method: K): void {
        if (this.throws(method)) {
            const throwingMethod = this.throwingMethods[method];
            if (throwingMethod?.error) throw throwingMethod.error;
            throw new Error(throwingMethod?.errorMessage);
        }
    }

    private throws<K extends keyof T>(method: K): boolean {
        return Object.keys(this.throwingMethods).some(
            (throwingMethod: string) => throwingMethod === method,
        );
    }
}
