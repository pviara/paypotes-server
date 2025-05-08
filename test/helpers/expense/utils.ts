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
import { userRepositoryToken } from '@users/persistence/user.repository-provider';
import { Member } from '@app/groups/domain/member';

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
    return Stakeholder.from(DEFAULT_USER);
};

const generateRandomPairPaymentWithDefaultUser = (
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
                share: 0,
            }),
    );
};

export const generateDefaultUserPairExpense = (): PairExpense => {
    const metadata = generateRandomMetadata();
    const payment = generateRandomPairPaymentWithDefaultUser();
    return new PairExpense(metadata, payment);
};

export const generateDefaultUserPairExpenses = ({
    length,
    counterparty,
}: RandomPairExpenseArrayGenerationOptions): Array<PairExpense> => {
    return Array.from({ length }).map((_, index) => {
        const metadata = generateRandomMetadata({ label: `label_${index}` });
        const payment = generateRandomPairPaymentWithDefaultUser(counterparty);
        return new PairExpense(metadata, payment);
    });
};

export const generateDefaultUserGroupExpense = (group: Group): GroupExpense => {
    const metadata = generateRandomMetadata();
    const payment = generateRandomGroupPaymentWithDefaultUserIn(group);
    return new GroupExpense(metadata, group, payment);
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
        return new GroupExpense(metadata, group, payment);
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
    };
}

export function generateRandomBalance(): number {
    return Math.floor(Math.random() * 350);
}

export function generateRandomBoolean(): boolean {
    return Math.random() < 0.5;
}

type RandomMetadataGenerationOptions = { label?: string };

type RandomPairExpenseArrayGenerationOptions = RandomArrayGenerationOptions & {
    counterparty?: Stakeholder;
};

type RandomGroupExpenseArrayGenerationOptions = RandomArrayGenerationOptions & {
    counterparty?: Member;
    group: Group;
};
