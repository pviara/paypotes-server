import { DEFAULT_USER } from '@test/doubles/auth/default-user';
import { ExpenseModule } from '@expenses/expense.module';
import { generateRandomUser } from '@test/helpers/user/utils';
import { Group } from '@groups/domain/group';
import {
    GroupExpense,
    GroupPayment,
} from '@expenses/domain/expense/group/group-expense';
import { Member } from '@groups/domain/member';
import { Expense, Metadata } from '@expenses/domain/expense/expense';
import {
    generateRandomGroup,
    generateRandomMember,
} from '@test/helpers/group/utils';
import { Modules } from '@test/helpers/application/model/module';
import {
    PairExpense,
    PairPayment,
} from '@expenses/domain/expense/pair/pair-expense';
import { RandomArrayGenerationOptions } from '@test/helpers/types';
import { Stakeholder } from '@expenses/domain/stakeholder/stakeholder';
import { User } from '@users/domain/user';
import { ZERO } from '@app/shared/zero';

export const expenseSpecModules: Modules = [ExpenseModule];

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

const generateRandomGroupPaymentWithoutDefaultUser = (): GroupPayment => {
    return {
        balance: generateRandomBalance(),
        creditor: generateRandomMember(),
    };
};

const generateRandomPairPaymentWithoutDefaultUser = (): PairPayment => {
    const user_a = generateRandomUser();
    const user_b = generateRandomUser();
    return {
        balance: generateRandomBalance(),
        debtor: user_a,
        creditor: user_b,
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

export const generateRandomGroupExpenses = ({
    length,
}: RandomPairExpenseArrayGenerationOptions): Array<GroupExpense> => {
    return Array.from({ length }).map((_, index) => {
        const metadata = generateRandomMetadata();
        const group = generateRandomGroup();
        const payment = generateRandomGroupPaymentWithoutDefaultUser();
        return GroupExpense.create(metadata, group, payment);
    });
};

export const generateRandomPairExpenses = ({
    length,
}: RandomPairExpenseArrayGenerationOptions): Array<PairExpense> => {
    return Array.from({ length }).map((_, index) => {
        const metadata = generateRandomMetadata();
        const payment = generateRandomPairPaymentWithoutDefaultUser();
        return PairExpense.create(metadata, payment);
    });
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
        const metadata = generateRandomMetadata({
            label: `label_${index}_${crypto.randomUUID().slice(0, 3)}`,
        });
        const payment = generateRandomPairPaymentWithDefaultUser(counterparty);
        return PairExpense.create(metadata, payment);
    });
};

export const generateDefaultUserCreditGroupExpense = (
    group: Group,
): GroupExpense => {
    const metadata = generateRandomMetadata();
    const payment = generateRandomGroupPaymentWithDefaultUserIn(group);
    return GroupExpense.create(metadata, group, payment);
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
        const metadata = generateRandomMetadata({
            label: `label_${index}_${crypto.randomUUID().slice(0, 3)}`,
        });
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
    }, ZERO);
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
