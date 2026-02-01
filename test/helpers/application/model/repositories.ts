import { ContactDatabaseTestingRepository } from '@test/helpers/contact/contact.database-testing-repository';
import { ExpensePostgresTestingRepository } from '@test/helpers/expense/expense.testing-repository';
import { GroupDatabaseTestingRepository } from '@test/helpers/group/group.database-testing-repository';
import { UserDatabaseTestingRepository } from '@test/helpers/user/user.database-testing-repository';

export type RepositoryType =
    | 'contactRepo'
    | 'expenseRepo'
    | 'groupRepo'
    | 'userRepo';

export type Repositories = {
    [key in RepositoryType]: key extends 'contactRepo'
        ? ContactDatabaseTestingRepository
        : key extends 'expenseRepo'
          ? ExpensePostgresTestingRepository
          : key extends 'groupRepo'
            ? GroupDatabaseTestingRepository
            : key extends 'userRepo'
              ? UserDatabaseTestingRepository
              : never;
};
