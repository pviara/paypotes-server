import { Application } from '@test/helpers/application/application';
import { ContactPostgresTestingRepository } from '@test/helpers/contact/contact.postgres-testing-repository';
import { ExpensePostgresTestingRepository } from '@test/helpers/expense/expense.testing-repository';
import { generateDefaultUserPairExpense } from '@test/helpers/expense/utils';
import { GroupPostgresTestingRepository } from '@test/helpers/group/group.postgres-testing-repository';
import { mapUsersFrom } from '@test/helpers/user/utils';
import { PairExpense } from '@expenses/domain/expense/pair/pair-expense';
import { User } from '@users/domain/user';
import { UserPostgresTestingRepository } from '@test/helpers/user/user.postgres-testing-repository';

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

    async setupDefaultUserPairExpense(): Promise<PairExpense> {
        const expense = generateDefaultUserPairExpense();
        const users = this.mapUsersOutOfStakeholdersFrom(expense);

        await this.userRepo.insert(...users);
        await this.expenseRepo.insert(expense);

        return expense;
    }

    private mapUsersOutOfStakeholdersFrom(expense: PairExpense): Array<User> {
        const stakeholders = expense.getStakeholders();
        return mapUsersFrom(stakeholders);
    }
}
