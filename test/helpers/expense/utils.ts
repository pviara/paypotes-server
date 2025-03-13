import { DEFAULT_USER } from '@test/doubles/auth/default-user';
import { ExpenseInMemoryTestingRepository } from '@test/helpers/expense/expense.testing-repository';
import { ExpenseModule } from '@expenses/expense.module';
import { expenseRepositoryToken } from '@expenses/persistence/expense.repository-provider';
import { Group } from '@groups/domain/group';
import { GroupExpense, GroupPayment } from '@expenses/domain/group-expense';
import { GroupInMemoryTestingRepository } from '@test/helpers/group/group.testing-repository';
import { groupRepositoryToken } from '@groups/persistence/group.repository-provider';
import { Metadata } from '@expenses/domain/expense';
import { Modules } from '@test/helpers/application-runner/model/module';
import { OverridingProviders } from '@test/helpers/application-runner/model/overriding-provider';
import { PairExpense, PairPayment } from '@expenses/domain/pair-expense';
import { RandomArrayGenerationOptions } from '@test/helpers/types';
import { Stakeholder } from '@expenses/domain/stakeholder';
import { UserInMemoryTestingRepository } from '@test/helpers/user/user.testing-repository';
import { userRepositoryToken } from '@users/persistence/user-repository.provider';

export const expenseSpecModules: Modules = [ExpenseModule];
export const expenseSpecProviders: OverridingProviders = [
    {
        provide: expenseRepositoryToken,
        useClass: ExpenseInMemoryTestingRepository,
    },
    {
        provide: groupRepositoryToken,
        useClass: GroupInMemoryTestingRepository,
    },
    {
        provide: userRepositoryToken,
        useClass: UserInMemoryTestingRepository,
    },
];

const getDefaultUserAsStakeholder = (): Stakeholder => {
    return Stakeholder.fromUser(DEFAULT_USER);
};

const getRandomPairPaymentWithDefaultUser = (
    counterparty?: Stakeholder,
): PairPayment => {
    const isDebtor = generateRandomBoolean();
    const isCreditor = !isDebtor;
    return {
        balance: generateRandomBalance(),
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
): GroupPayment => {
    const isDebtor = generateRandomBoolean();
    const isCreditor = !isDebtor;
    return {
        balance: generateRandomBalance(),
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

export function generateRandomBalance(): number {
    return Math.floor(Math.random() * 350);
}

export function generateRandomBoolean(): boolean {
    return Math.random() < 0.5;
}

type RandomPairExpenseArrayGenerationOptions = RandomArrayGenerationOptions & {
    counterparty?: Stakeholder;
};

type RandomGroupExpenseArrayGenerationOptions =
    RandomPairExpenseArrayGenerationOptions & {
        group: Group;
    };
