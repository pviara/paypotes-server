import { DEFAULT_USER } from '@test/doubles/auth/default-user';
import { ExpenseInMemoryTestingRepository } from '@test/helpers/expense/expense.testing-repository';
import { ExpenseModule } from '@expenses/expense.module';
import { expenseRepositoryToken } from '@expenses/persistence/expense.repository-provider';
import { Group } from '@groups/domain/group';
import { GroupExpense } from '@expenses/domain/group-expense';
import { Metadata } from '@expenses/domain/expense';
import { Modules } from '@test/helpers/application-runner/model/module';
import { OverridingProviders } from '@test/helpers/application-runner/model/overriding-provider';
import { PairExpense } from '@expenses/domain/pair-expense';
import { RandomArrayGenerationOptions } from '@test/helpers/types';
import { Stakeholder } from '@expenses/domain/stakeholder';

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

const getRandomPairPaymentWithDefaultUser = (
    counterparty?: Stakeholder,
): PairExpense['payment'] => {
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

const getRandomGroupPaymentWithDefaultUser = (
    counterparty?: Stakeholder,
): GroupExpense['payment'] => {
    const isDebtor = Math.random() < 0.5;
    const isCreditor = !isDebtor;
    return {
        balance: Math.floor(Math.random() * 350),
        debtors: isDebtor
            ? [getDefaultUserAsStakeholder()]
            : [counterparty || generateRandomStakeholder()],
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

export const generateDefaultUserPairExpense = (): PairExpense => {
    const metadata: Metadata = {
        id: crypto.randomUUID(),
        emoji: '📦',
        label: 'Label',
    };
    const payment = getRandomPairPaymentWithDefaultUser();
    return new PairExpense(metadata, payment);
};

export const generateDefaultUserPairExpenses = ({
    length,
    counterparty,
}: RandomPairExpenseArrayGenerationOptions): Array<PairExpense> => {
    return Array.from({ length }).map((_, index) => {
        const metadata: Metadata = {
            id: crypto.randomUUID(),
            emoji: '📦',
            label: `label_${index}`,
        };
        const payment = getRandomPairPaymentWithDefaultUser(counterparty);
        return new PairExpense(metadata, payment);
    });
};

export const generateDefaultUserGroupExpense = (group: Group): GroupExpense => {
    const metadata: Metadata = {
        id: crypto.randomUUID(),
        emoji: '📦',
        label: 'Label',
    };
    const payment = getRandomGroupPaymentWithDefaultUser();
    return new GroupExpense(metadata, group, payment);
};

export const generateDefaultUserGroupExpenses = ({
    length,
    counterparty,
    group,
}: RandomGroupExpenseArrayGenerationOptions): Array<GroupExpense> => {
    return Array.from({ length }).map((_, index) => {
        const metadata: Metadata = {
            id: crypto.randomUUID(),
            emoji: '📦',
            label: `label_${index}`,
        };
        const payment = getRandomGroupPaymentWithDefaultUser(counterparty);
        return new GroupExpense(metadata, group, payment);
    });
};

type RandomPairExpenseArrayGenerationOptions = RandomArrayGenerationOptions & {
    counterparty?: Stakeholder;
};

type RandomGroupExpenseArrayGenerationOptions =
    RandomPairExpenseArrayGenerationOptions & {
        group: Group;
    };
