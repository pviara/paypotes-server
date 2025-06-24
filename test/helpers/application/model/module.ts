import { DynamicModule, Type } from '@nestjs/common';

export type Module = Type | Promise<DynamicModule>;
export type Modules = Module[];
