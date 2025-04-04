import { DEFAULT_USER } from '@test/doubles/auth/default-user';
import { ContactRepositorySpy } from '@test/doubles/contact-repository.spy';
import { ExpenseRepositorySpy } from '@test/doubles/expense-repository.spy';
import { ExpensesByContact } from '@expenses/persistence/expense.repository';
import { generateRandomContacts } from '@test/helpers/contact/utils';
import {
    GetActorContactsWithBalanceHandler,
    GetActorContactsWithBalanceQuery,
} from '@app/contacts/application/get-actor-contacts-with-balance.handler';
import { mapIdsFrom } from '@test/helpers/utils';
import { Stakeholder } from '@app/expenses/domain/stakeholder';
import { generateRandomMetadata } from '@test/helpers/expense/utils';
import { PairExpense, PairPayment } from '@expenses/domain/pair-expense';

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
    const dummyStakeholders = dummyContacts.map((contact) =>
        Stakeholder.fromContact(contact),
    );

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

    it("'should retrieve all actor's contacts expenses", async () => {
        await sut.execute(dummyQuery);

        expect(expenseRepo.calls.getAllActorContactsExpenses.count).toBe(1);

        const contactIds = mapIdsFrom(dummyContacts);
        expect(
            expenseRepo.calls.getAllActorContactsExpenses.history,
        ).toContainEqual([dummyActorId, contactIds]);
    });

    it('should compute each of the actor contact balance correctly', async () => {
        const expensesByContact: ExpensesByContact = {};
        dummyStakeholders.forEach((stakeholder) => {
            expensesByContact[stakeholder.getId()] = [
                createRandomCreditExpenseFor(stakeholder, 894),
                createRandomDebitExpenseFor(stakeholder, 145),
                createRandomDebitExpenseFor(stakeholder, 311),
                createRandomCreditExpenseFor(stakeholder, 28),
            ];
        });
        expenseRepo.stub('getAllActorContactsExpenses', expensesByContact);

        const contacts = await sut.execute(dummyQuery);

        expect(contacts.length).toBe(dummyContacts.length);

        const expectedBalance = 894 - 145 - 311 + 28;
        contacts.forEach((contact) =>
            expect(contact.getBalance()).toBe(expectedBalance),
        );

        // // console.dir(expensesByContact, { depth: null });
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
        stakeholder: Stakeholder,
        balance: number,
    ): PairExpense {
        const metadata = generateRandomMetadata();
        const payment: PairPayment = {
            balance,
            creditor: Stakeholder.fromUser(DEFAULT_USER),
            debtor: stakeholder,
        };
        return new PairExpense(metadata, payment);
    }

    function createRandomDebitExpenseFor(
        stakeholder: Stakeholder,
        balance: number,
    ): PairExpense {
        const metadata = generateRandomMetadata();
        const payment: PairPayment = {
            balance,
            creditor: stakeholder,
            debtor: Stakeholder.fromUser(DEFAULT_USER),
        };
        return new PairExpense(metadata, payment);
    }
});
