import { Application } from '@test/helpers/application/application';
import { Contact } from '@contacts/domain/contact';
import { ContactPostgresTestingRepository } from '@test/helpers/contact/contact.postgres-testing-repository';
import { DEFAULT_USER } from '@test/doubles/auth/default-user';
import { Expense } from '@expenses/domain/expense/expense';
import { ExpensePostgresTestingRepository } from '@test/helpers/expense/expense.testing-repository';
import {
    generateDefaultUserGroupExpense,
    generateDefaultUserGroupExpenses,
    generateDefaultUserPairExpense,
    generateDefaultUserPairExpenses,
    generateRandomBalance,
    generateRandomGroupExpenses,
    generateRandomMetadata,
    generateRandomPairExpenses,
} from '@test/helpers/expense/utils';
import { generateDefaultUserRandomGroup } from './group/utils';
import {
    generateRandomUser,
    mapUserFrom,
    mapUsersFrom,
} from '@test/helpers/user/utils';
import { Group } from '@groups/domain/group';
import {
    GroupExpense,
    GroupPayment,
} from '@expenses/domain/expense/group/group-expense';
import { GroupPostgresTestingRepository } from '@test/helpers/group/group.postgres-testing-repository';
import { Member } from '@groups/domain/member';
import { PairExpense } from '@expenses/domain/expense/pair/pair-expense';
import { User } from '@users/domain/user';
import { UserPostgresTestingRepository } from '@test/helpers/user/user.postgres-testing-repository';

type Options = { length: number };

export class Fixture {
    private constructor(
        private contactRepo: ContactPostgresTestingRepository,
        private expenseRepo: ExpensePostgresTestingRepository,
        private groupRepo: GroupPostgresTestingRepository,
        private userRepo: UserPostgresTestingRepository,
    ) {}

    static create(application: Application): Fixture {
        const { contactRepo, expenseRepo, groupRepo, userRepo } =
            application.getRepositories();

        return new Fixture(contactRepo, expenseRepo, groupRepo, userRepo);
    }

    async setupDefaultUserContact(): Promise<Contact> {
        const user = generateRandomUser();

        await this.userRepo.insert(DEFAULT_USER, user);
        await this.contactRepo.addRelationshipsBetween([DEFAULT_USER, user]);

        return Contact.fromUser(user);
    }

    async setupDefaultUserGroup(): Promise<Group> {
        const group = generateDefaultUserRandomGroup();
        const users = this.mapUsersOutOfMembersFrom(group);

        await this.userRepo.insert(...users);
        await this.groupRepo.insert(group);

        return group;
    }

    async setupDefaultUserCreditGroupExpense(): Promise<GroupExpense> {
        const group = generateDefaultUserRandomGroup();
        const expense = this.generateRandomCreditExpenseFor(group);
        const users = this.mapUsersOutOfMembersFrom(group);

        await this.userRepo.insert(...users);
        await this.groupRepo.insert(group);
        await this.expenseRepo.insert(expense);

        return expense;
    }

    async setupDefaultUserDebitGroupExpense(): Promise<GroupExpense> {
        const group = generateDefaultUserRandomGroup();
        const expense = this.generateRandomDebitExpenseFor(group);
        const users = this.mapUsersOutOfMembersFrom(group);

        await this.userRepo.insert(...users);
        await this.groupRepo.insert(group);
        await this.expenseRepo.insert(expense);

        return expense;
    }

    async setupDefaultUserGroupExpense(): Promise<GroupExpense> {
        const group = generateDefaultUserRandomGroup();
        const expense = generateDefaultUserGroupExpense(group);
        const users = this.mapUsersOutOfMembersFrom(group);

        await this.userRepo.insert(...users);
        await this.groupRepo.insert(group);
        await this.expenseRepo.insert(expense);

        return expense;
    }

    async setupDefaultUserPairExpense(): Promise<PairExpense> {
        const expense = generateDefaultUserPairExpense();
        const users = this.mapUsersOutOfStakeholdersFrom(expense);

        await this.userRepo.insert(...users);
        await this.expenseRepo.insert(expense);

        return expense;
    }

    async setupDefaultUserPairExpenses(): Promise<PairExpense[]> {
        const expenses = generateDefaultUserPairExpenses({ length: 10 });
        const users = expenses.flatMap((expense) =>
            this.mapUsersOutOfStakeholdersFrom(expense),
        );

        await this.userRepo.insert(DEFAULT_USER, ...users);
        await this.expenseRepo.insert(...expenses);

        return expenses;
    }

    async setupDefaultUserUniqueContactPairExpenses(
        options?: Options,
    ): Promise<{
        contact: Contact;
        expenses: Array<PairExpense>;
    }> {
        const contact = await this.setupDefaultUserContact();
        const expenses = generateDefaultUserPairExpenses({
            counterparty: mapUserFrom(contact),
            length: options?.length ?? 40,
        });

        await this.expenseRepo.insert(...expenses);

        return { contact, expenses };
    }

    async setupDefaultUserUniqueGroupExpenses(options?: Options): Promise<{
        group: Group;
        expenses: Array<GroupExpense>;
    }> {
        const group = await this.setupDefaultUserGroup();
        const expenses = generateDefaultUserGroupExpenses({
            length: options?.length ?? 40,
            group,
        });
        const users = expenses.flatMap((expense) =>
            this.mapUsersOutOfStakeholdersFrom(expense),
        );

        await this.userRepo.insert(...users);
        await this.expenseRepo.insert(...expenses);

        return { group, expenses };
    }

    async setupRandomGroupExpenses(options?: Options): Promise<GroupExpense[]> {
        const expenses = generateRandomGroupExpenses({
            length: options?.length ?? 40,
        });

        const users = expenses.flatMap((expense) =>
            this.mapUsersOutOfStakeholdersFrom(expense),
        );

        const groups = expenses.flatMap((expense) => expense.getGroup());

        await this.userRepo.insert(...users);
        await this.groupRepo.insert(...groups);
        await this.expenseRepo.insert(...expenses);

        return expenses;
    }

    async setupRandomPairExpenses(options?: Options): Promise<PairExpense[]> {
        const expenses = generateRandomPairExpenses({
            length: options?.length ?? 40,
        });
        const users = expenses.flatMap((expense) =>
            this.mapUsersOutOfStakeholdersFrom(expense),
        );

        await this.userRepo.insert(...users);
        await this.expenseRepo.insert(...expenses);

        return expenses;
    }

    async setupRandomUser(): Promise<User> {
        const user = generateRandomUser();
        await this.userRepo.insert(user);
        return user;
    }

    private mapUsersOutOfStakeholdersFrom(expense: Expense): Array<User> {
        const stakeholders = expense.getStakeholders();
        return mapUsersFrom(stakeholders);
    }

    private mapUsersOutOfMembersFrom(group: Group): Array<User> {
        const members = group.getMembers();
        return mapUsersFrom(members);
    }

    private generateRandomCreditExpenseFor(group: Group): GroupExpense {
        const metadata = generateRandomMetadata();
        const payment: GroupPayment = {
            balance: generateRandomBalance(),
            creditor: Member.fromUser(DEFAULT_USER),
        };
        return GroupExpense.create(metadata, group, payment);
    }

    private generateRandomDebitExpenseFor(group: Group): GroupExpense {
        const metadata = generateRandomMetadata();
        const payment: GroupPayment = {
            balance: generateRandomBalance(),
            creditor: group.getMembersExcluding(DEFAULT_USER.getId())[0],
        };
        return GroupExpense.create(metadata, group, payment);
    }
}
