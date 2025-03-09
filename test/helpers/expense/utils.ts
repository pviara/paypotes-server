import { DEFAULT_USER } from '@test/doubles/auth/default-user';
import { Expense, Payment } from '@expenses/domain/expense';
import { ExpenseInMemoryTestingRepository } from '@test/helpers/expense/expense.testing-repository';
import { ExpenseModule } from '@expenses/expense.module';
import { expenseRepositoryToken } from '@expenses/persistence/expense.repository-provider';
import { Modules } from '@test/helpers/application-runner/model/module';
import { OverridingProviders } from '@test/helpers/application-runner/model/overriding-provider';
import { RandomArrayGenerationOptions } from '@test/helpers/types';
import { Stakeholder } from '@expenses/domain/stakeholder';
import { Group } from '@app/groups/domain/group';

export const expenseSpecModules: Modules = [ExpenseModule];
export const expenseSpecProviders: OverridingProviders = [
    {
        provide: expenseRepositoryToken,
        useClass: ExpenseInMemoryTestingRepository,
    },
];

const getDefaultUserAsStakeholder = (): Stakeholder => {
    return Stakeholder.fromUser(DEFAULT_USER);
};

const getRandomPaymentWithDefaultUser = (
    counterparty?: Stakeholder,
): Payment => {
    const isDebtor = Math.random() < 0.5;
    const isCreditor = !isDebtor;
    return {
        balance: Math.floor(Math.random() * 350),
        debtor: isDebtor
            ? getDefaultUserAsStakeholder()
            : counterparty || generateRandomStakeholder(),
        creditor: isCreditor
            ? getDefaultUserAsStakeholder()
            : counterparty || generateRandomStakeholder(),
    };
};

export const generateRandomStakeholder = (): Stakeholder => {
    return new Stakeholder({
        id: crypto.randomUUID(),
        firstname: 'Firstname',
        lastname: 'Lastname',
    });
};

export const generateDefaultUserExpense = (): Expense => {
    return new Expense({
        id: crypto.randomUUID(),
        emoji: '📦',
        label: 'Label',
        payment: getRandomPaymentWithDefaultUser(),
    });
};

type RandomExpenseArrayGenerationOptions = RandomArrayGenerationOptions & {
    counterparty?: Stakeholder;
    group?: Group;
};

export const generateDefaultUserExpenses = ({
    length,
    counterparty,
    group,
}: RandomExpenseArrayGenerationOptions): Array<Expense> => {
    return Array.from({ length }).map(
        (_, index) =>
            new Expense({
                id: crypto.randomUUID(),
                emoji: '📦',
                label: `label_${index}`,
                group,
                payment: getRandomPaymentWithDefaultUser(counterparty),
            }),
    );
};
