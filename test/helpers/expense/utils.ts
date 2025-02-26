import { ExpenseModule } from '@expenses/expense.module';
import { Modules } from '@test/helpers/application-runner/model/module';
import { OverridingProviders } from '@test/helpers/application-runner/model/overriding-provider';

export const expenseSpecModules: Modules = [ExpenseModule];
export const expenseSpecProviders: OverridingProviders = [];
