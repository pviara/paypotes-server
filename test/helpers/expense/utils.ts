import { DEFAULT_USER } from '@test/doubles/auth/default-user';
import { ExpenseInMemoryTestingRepository } from '@test/helpers/expense/expense.testing-repository';
import { ExpenseModule } from '@expenses/expense.module';
import { expenseRepositoryToken } from '@expenses/persistence/expense.repository-provider';
import { generateRandomUser } from '@test/helpers/user/utils';
import { Group } from '@groups/domain/group';
import {
    GroupExpense,
    GroupPayment,
} from '@expenses/domain/expense/group/group-expense';
import { GroupInMemoryTestingRepository } from '@test/helpers/group/group.testing-repository';
import { groupRepositoryToken } from '@groups/persistence/group.repository-provider';
import { Member } from '@groups/domain/member';
import { Expense, Metadata } from '@expenses/domain/expense/expense';
import { Modules } from '@test/helpers/application/model/module';
import { Providers } from '@test/helpers/application/application';
import {
    PairExpense,
    PairPayment,
} from '@expenses/domain/expense/pair/pair-expense';
import { RandomArrayGenerationOptions } from '@test/helpers/types';
import { Stakeholder } from '@expenses/domain/stakeholder/stakeholder';
import { User } from '@users/domain/user';
import { UserInMemoryTestingRepository } from '@test/helpers/user/user.testing-repository';
import { userRepositoryToken } from '@users/persistence/user.repository-provider';

export const expenseSpecModules: Modules = [ExpenseModule];
export const expenseSpecProviders: Providers = [
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

const generateRandomPairPaymentWithDefaultUser = (
    counterparty?: User,
): PairPayment => {
    const isDebtor = generateRandomBoolean();
    const isCreditor = !isDebtor;
    return {
        balance: generateRandomBalance(),
        debtor: isDebtor ? DEFAULT_USER : counterparty || generateRandomUser(),
        creditor: isCreditor
            ? DEFAULT_USER
            : counterparty || generateRandomUser(),
    };
};

const generateRandomGroupPaymentWithDefaultUserIn = (
    group: Group,
    counterparty?: Member,
): GroupPayment => {
    const isDebtor = generateRandomBoolean();
    const isCreditor = !isDebtor;

    const defaultMember = getDefaultUserAsMemberIn(group);
    const otherMembers = group.getMembersExcluding(defaultMember.getId());
    const randomGroupMember = getRandomMemberFrom(otherMembers);

    return {
        balance: generateRandomBalance(),
        creditor: isCreditor
            ? defaultMember
            : counterparty || randomGroupMember,
    };
};

export const generateRandomStakeholder = (): Stakeholder => {
    return new Stakeholder({
        id: crypto.randomUUID(),
        firstname: 'Firstname',
        lastname: 'Lastname',
        avatarUrl: 'http://localhost:port/avatar_url',
        share: 0,
    });
};

export const generateRandomStakeholders = ({
    length,
}: RandomArrayGenerationOptions): Array<Stakeholder> => {
    return Array.from({ length }).map(
        (_, index) =>
            new Stakeholder({
                id: crypto.randomUUID(),
                firstname: `f_${index}`,
                lastname: `l_${index}`,
                avatarUrl: 'http://localhost:port/avatar_url',
                share: 0,
            }),
    );
};

export const generateDefaultUserPairExpense = (): PairExpense => {
    const metadata = generateRandomMetadata();
    const payment = generateRandomPairPaymentWithDefaultUser();
    return PairExpense.create(metadata, payment);
};

export const generateDefaultUserPairExpenses = ({
    length,
    counterparty,
}: RandomPairExpenseArrayGenerationOptions): Array<PairExpense> => {
    return Array.from({ length }).map((_, index) => {
        const metadata = generateRandomMetadata({ label: `label_${index}` });
        const payment = generateRandomPairPaymentWithDefaultUser(counterparty);
        return PairExpense.create(metadata, payment);
    });
};

export const generateDefaultUserGroupExpense = (group: Group): GroupExpense => {
    const metadata = generateRandomMetadata();
    const payment = generateRandomGroupPaymentWithDefaultUserIn(group);
    return GroupExpense.create(metadata, group, payment);
};

export const generateDefaultUserGroupExpenses = ({
    length,
    counterparty,
    group,
}: RandomGroupExpenseArrayGenerationOptions): Array<GroupExpense> => {
    return Array.from({ length }).map((_, index) => {
        const metadata = generateRandomMetadata({ label: `label_${index}` });
        const payment = generateRandomGroupPaymentWithDefaultUserIn(
            group,
            counterparty,
        );
        return GroupExpense.create(metadata, group, payment);
    });
};

function getRandomMemberFrom(otherMembers: Array<Member>): Member {
    const randomIndex = Math.floor(Math.random() * otherMembers.length);
    return otherMembers[randomIndex];
}

function getDefaultUserAsMemberIn(group: Group) {
    const defaultMember = group
        .getMembers()
        .find((member) => member.getId() === DEFAULT_USER.getId());

    if (!defaultMember)
        throw new Error('Could not find default user as member in group');

    return defaultMember;
}

export function generateRandomMetadata(
    options?: RandomMetadataGenerationOptions,
): Metadata {
    return {
        id: crypto.randomUUID(),
        emoji: '📦',
        label: options?.label ?? 'Label',
        createdAt: generateRandomPastDate(),
    };
}

export function generateRandomBalance(): number {
    return Math.floor(Math.random() * 12000);
}

export function generateRandomBoolean(): boolean {
    return Math.random() < 0.5;
}

export const calculateExpectedBalanceFor = (
    expenses: Array<Expense>,
): number => {
    return expenses.reduce((prev, current) => {
        const isDefaultUserCreditor = current.hasCreditor(DEFAULT_USER.getId());
        const balance = calculateBalanceBasedOn(current, isDefaultUserCreditor);
        return prev + (isDefaultUserCreditor ? balance : -balance);
    }, 0);
};

const generateRandomPastDate = (): Date => {
    return new Date(
        Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000),
    );
};

const calculateBalanceBasedOn = (
    expense: Expense,
    isDefaultUserCreditor: boolean,
): number => {
    if (expense instanceof GroupExpense) {
        const members = expense.getGroup().getMembers().length;
        const balance = +expense.getBalance();

        const membersTotalOwedShares = (balance / members) * (members - 1);
        const defaultUserShare = expense.getShareOf(DEFAULT_USER.getId());

        return isDefaultUserCreditor
            ? membersTotalOwedShares
            : defaultUserShare;
    }
    const share = +expense.getBalance() / 2;
    console.log('expense share for balance', expense.getBalance(), share);
    return share;
};

type RandomMetadataGenerationOptions = { label?: string };

type RandomPairExpenseArrayGenerationOptions = RandomArrayGenerationOptions & {
    counterparty?: User;
};

type RandomGroupExpenseArrayGenerationOptions = RandomArrayGenerationOptions & {
    counterparty?: Member;
    group: Group;
};
