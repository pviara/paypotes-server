type ConsoleLevel = 'log' | 'error' | 'debug' | 'warn';

export const Log = (level: ConsoleLevel) => {
    return (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor,
    ) => {
        const decoratedMethod = descriptor.value;
        descriptor.value = async function (
            ...args: Array<unknown>
        ): Promise<unknown> {
            const context = target.constructor.name;
            console[level](`[${context}] Called method ${propertyKey}`);

            try {
                return await decoratedMethod.apply(this, args);
            } catch (error: any) {
                console.error(`[${context}] Error thrown: ${error['message']}`);
                throw error;
            }
        };
    };
};
