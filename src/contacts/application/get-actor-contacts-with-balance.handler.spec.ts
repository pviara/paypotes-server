import { Contact } from '@contacts/domain/contact';
import { DEFAULT_USER } from '@test/doubles/auth/default-user';
import { ContactRepositorySpy } from '@test/doubles/contact-repository.spy';
import { ExpenseRepositorySpy } from '@test/doubles/expense-repository.spy';
import { ExpensesByContact } from '@expenses/persistence/expense.repository';
import { generateRandomContacts } from '@test/helpers/contact/utils';
import {
    GetActorContactsWithBalanceHandler,
    GetActorContactsWithBalanceQuery,
} from '@contacts/application/get-actor-contacts-with-balance.handler';
import { mapIdsFrom } from '@test/helpers/utils';
import { generateRandomMetadata } from '@test/helpers/expense/utils';
import {
    PairExpense,
    PairPayment,
} from '@app/expenses/domain/pair-expense/pair-expense';
import { User } from '@users/domain/user';
import { mapUserFrom } from '@test/helpers/user/utils';

describe('GetActorContactsHandler', () => {
    let sut: GetActorContactsWithBalanceHandler;

    let contactRepo: ContactRepositorySpy;
    let expenseRepo: ExpenseRepositorySpy;

    const dummyActorId = DEFAULT_USER.getId();
    const dummyPageIndex = 0;
    const dummySearch = 'a contact firstname or lastname';

    const dummyQuery = new GetActorContactsWithBalanceQuery({
        actorId: dummyActorId,
        pageIndex: dummyPageIndex,
        search: dummySearch,
    });

    const dummyContacts = generateRandomContacts({ length: 30 });
    const dummyUser = dummyContacts.map((contact) => mapUserFrom(contact));

    beforeEach(() => {
        initSut();
        contactRepo.stub('getActorContacts', dummyContacts);
    });

    it("should retrieve the actor's contacts", async () => {
        await sut.execute(dummyQuery);
        expect(contactRepo.calls.getActorContacts.count).toBe(1);
        expect(contactRepo.calls.getActorContacts.history).toContainEqual([
            dummyActorId,
            dummyPageIndex,
            dummySearch,
        ]);
    });

    it("should retrieve all actor's contacts expenses", async () => {
        await sut.execute(dummyQuery);

        expect(expenseRepo.calls.getAllActorContactsExpenses.count).toBe(1);

        const contactIds = mapIdsFrom(dummyContacts);
        expect(
            expenseRepo.calls.getAllActorContactsExpenses.history,
        ).toContainEqual([dummyActorId, contactIds]);
    });

    it("should compute each of the actor's contacts balance correctly", async () => {
        const expensesByContact: ExpensesByContact = {};
        dummyUser.forEach((stakeholder) => {
            expensesByContact[stakeholder.getId()] = [
                createRandomCreditExpenseFor(stakeholder, 894),
                createRandomDebitExpenseFor(stakeholder, 158),
                createRandomDebitExpenseFor(stakeholder, 310),
                createRandomCreditExpenseFor(stakeholder, 28),
            ];
        });
        expenseRepo.stub('getAllActorContactsExpenses', expensesByContact);

        const contacts = await sut.execute(dummyQuery);

        expect(contacts.length).toBe(dummyContacts.length);

        const expectedBalance = 894 / 2 - 158 / 2 - 310 / 2 + 28 / 2;
        contacts.forEach((contact) =>
            expect(contact.getBalance()).toBe(expectedBalance),
        );
    });

    function initSut(): void {
        initDependencies();
        sut = new GetActorContactsWithBalanceHandler(contactRepo, expenseRepo);
    }

    function initDependencies(): void {
        contactRepo = new ContactRepositorySpy();
        expenseRepo = new ExpenseRepositorySpy();
    }

    function createRandomCreditExpenseFor(
        user: User,
        balance: number,
    ): PairExpense {
        const metadata = generateRandomMetadata();
        const payment: PairPayment = {
            balance,
            creditor: DEFAULT_USER,
            debtor: user,
        };
        return new PairExpense(metadata, payment);
    }

    function createRandomDebitExpenseFor(
        stakeholder: User,
        balance: number,
    ): PairExpense {
        const metadata = generateRandomMetadata();
        const payment: PairPayment = {
            balance,
            creditor: stakeholder,
            debtor: DEFAULT_USER,
        };
        return new PairExpense(metadata, payment);
    }
});
