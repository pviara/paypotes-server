type Callback<T> = () => T;
export type AsyncCallback<T> = Callback<Promise<T>>;

export type RandomArrayGenerationOptions = { length: number };
