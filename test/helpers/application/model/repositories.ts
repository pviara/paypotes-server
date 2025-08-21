import { ContactPostgresTestingRepository } from '@test/helpers/contact/contact.postgres-testing-repository';
import { ExpensePostgresTestingRepository } from '@test/helpers/expense/expense.testing-repository';
import { GroupPostgresTestingRepository } from '@test/helpers/group/group.postgres-testing-repository';
import { UserPostgresTestingRepository } from '@test/helpers/user/user.postgres-testing-repository';

export type RepositoryType =
    | 'contactRepo'
    | 'expenseRepo'
    | 'groupRepo'
    | 'userRepo';

export type Repositories = {
    [key in RepositoryType]: key extends 'contactRepo'
        ? ContactPostgresTestingRepository
        : key extends 'expenseRepo'
          ? ExpensePostgresTestingRepository
          : key extends 'groupRepo'
            ? GroupPostgresTestingRepository
            : key extends 'userRepo'
              ? UserPostgresTestingRepository
              : never;
};
