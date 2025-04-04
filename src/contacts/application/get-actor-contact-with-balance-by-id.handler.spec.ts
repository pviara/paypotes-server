import { DEFAULT_USER } from '@test/doubles/auth/default-user';
import { Contact } from '@contacts/domain/contact';
import { ContactRepositorySpy } from '@test/doubles/contact-repository.spy';
import {
    ContactNotFoundError,
    GetActorContactWithBalanceByIdHandler,
    GetActorContactWithBalanceByIdQuery,
} from '@app/contacts/application/get-actor-contact-with-balance-by-id.handler';
import { ExpenseRepositorySpy } from '@test/doubles/expense-repository.spy';
import { generateRandomMetadata } from '@test/helpers/expense/utils';
import { PairExpense, PairPayment } from '@expenses/domain/pair-expense';
import { Stakeholder } from '@expenses/domain/stakeholder';

describe('GetActorContactWithBalanceByIdHandler', () => {
    let sut: GetActorContactWithBalanceByIdHandler;

    let contactRepo: ContactRepositorySpy;
    let expenseRepo: ExpenseRepositorySpy;

    const dummyActorId = DEFAULT_USER.getId();
    const dummyContactId = crypto.randomUUID();
    const dummyQuery = new GetActorContactWithBalanceByIdQuery({
        actorId: dummyActorId,
        contactId: dummyContactId,
    });

    const dummyContact = new Contact({
        id: dummyContactId,
        firstname: 'Peter',
        lastname: 'Parker',
    });

    const dummyStakeholder = new Stakeholder({
        id: dummyContactId,
        firstname: 'Eric',
        lastname: 'Evans',
    });

    beforeEach(() => {
        initSut();
        contactRepo.stub('getActorContactById', dummyContact);
    });

    it("should retrieve the actor's contact by its id", async () => {
        await sut.execute(dummyQuery);

        expect(contactRepo.calls.getActorContactById.count).toBe(1);
        expect(contactRepo.calls.getActorContactById.history).toContainEqual([
            dummyActorId,
            dummyContactId,
        ]);
    });

    it("should retrieve the actor's contact expenses", async () => {
        await sut.execute(dummyQuery);
        expect(expenseRepo.calls.getAllActorContactExpenses.count).toBe(1);
        expect(
            expenseRepo.calls.getAllActorContactExpenses.history,
        ).toContainEqual([dummyActorId, dummyContactId]);
    });

    it('should compute the actor contact balance correctly', async () => {
        const expenses = [
            createRandomCreditExpense(1500),
            createRandomDebitExpense(790),
            createRandomDebitExpense(2400),
            createRandomCreditExpense(1100),
        ];
        expenseRepo.stub('getAllActorContactExpenses', expenses);

        const contact = await sut.execute(dummyQuery);

        const expectedBalance = 1500 - 790 - 2400 + 1100;
        expect(contact.getBalance()).toBe(expectedBalance);
    });

    describe("actor's contact doesn't exist", () => {
        it('should throw an error', async () => {
            contactRepo.stub('getActorContactById', null);
            await expect(sut.execute(dummyQuery)).rejects.toThrow(
                ContactNotFoundError,
            );
        });
    });

    function initSut(): void {
        initDependencies();
        sut = new GetActorContactWithBalanceByIdHandler(
            contactRepo,
            expenseRepo,
        );
    }

    function initDependencies(): void {
        contactRepo = new ContactRepositorySpy();
        expenseRepo = new ExpenseRepositorySpy();
    }

    function createRandomCreditExpense(balance: number): PairExpense {
        const metadata = generateRandomMetadata();
        const payment: PairPayment = {
            balance,
            creditor: Stakeholder.fromUser(DEFAULT_USER),
            debtor: dummyStakeholder,
        };
        return new PairExpense(metadata, payment);
    }

    function createRandomDebitExpense(balance: number): PairExpense {
        const metadata = generateRandomMetadata();
        const payment: PairPayment = {
            balance,
            creditor: dummyStakeholder,
            debtor: Stakeholder.fromUser(DEFAULT_USER),
        };
        return new PairExpense(metadata, payment);
    }
});
