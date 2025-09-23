import { App } from 'supertest/types';
import { BalanceDTO } from '@app/shared/dto/balance.dto';
import { Contact } from '@contacts/domain/contact';
import { ContactWithBalanceDTO } from '../dto/contact-with-balance.dto';
import { CONTACTS_API_ROUTE } from '@contacts/presentation/contact.controller';
import { DEFAULT_USER } from '@test/doubles/auth/default-user';
import { empty, shutdown } from '@test/helpers/utils';
import { Fixture } from '@test/helpers/fixture';
import { contactSpecModules as modules } from '@test/helpers/contact/utils';
import { HttpStatus } from '@nestjs/common';
import { initApplicationWith } from '@test/helpers/application/utils';
import { PairExpense } from '@expenses/domain/expense/pair/pair-expense';
import { PairExpenseSnapshot } from '@expenses/domain/expense/pair/pair-expense-snapshot';
import * as request from 'supertest';

describe('getActorContacts', () => {
    const application = initApplicationWith(modules);

    let fixture: Fixture;
    let httpServer: App;

    beforeAll(async () => {
        await application.bootstrap();

        fixture = Fixture.create(application);
        httpServer = application.getHttpServer();
    });

    afterAll(shutdown(application));

    beforeEach(empty(application));

    afterEach(empty(application));

    describe('actor has no contact', () => {
        it('should return an empty array', async () => {
            const response = await request(httpServer).get(
                `/${CONTACTS_API_ROUTE}`,
            );

            expect(response.status).toBe(HttpStatus.OK);
            expect(response.body.length).toBe(0);
        });
    });

    describe('actor has contacts', () => {
        let dummyContacts: Array<Contact>;

        beforeEach(async () => {
            dummyContacts = await fixture.setupDefaultUserContacts();
        });

        it('should return the first 20 contacts by default', async () => {
            const response = await request(httpServer).get(
                `/${CONTACTS_API_ROUTE}`,
            );

            const dtos = response.body;
            expect(dtos.length).toBe(20);
            expectReturnedDtosToBeTheFirstTwentyContacts(dtos);
        });

        describe('page index has been given', () => {
            it('should return the second 20 contacts when given index is 1', async () => {
                const response = await request(httpServer).get(
                    `/${CONTACTS_API_ROUTE}?pageIndex=1`,
                );

                const dtos = response.body;
                expect(dtos.length).toBe(20);
                expectReturnedDtosToBeTheSecondTwentyContacts(dtos);
            });

            function expectReturnedDtosToBeTheSecondTwentyContacts(
                dtos: Array<ContactWithBalanceDTO>,
            ): void {
                const secondTwentyContacts = dummyContacts.slice(20, 40);
                const returnedDtosAreTheSecondTwentyContacts = dtos.every(
                    dtoIsIn(secondTwentyContacts),
                );

                expect(returnedDtosAreTheSecondTwentyContacts).toBe(true);
            }
        });

        describe('search has been given', () => {
            it('should return the contacts that match the search', async () => {
                const targetContact = dummyContacts[0];
                const response = await request(httpServer).get(
                    `/${CONTACTS_API_ROUTE}?search=${targetContact.getFirstname()}`,
                );

                expect(response.body.length).toBe(1);
                expect(response.body[0].id).toBe(targetContact.getId());
            });
        });

        function expectReturnedDtosToBeTheFirstTwentyContacts(
            dtos: Array<ContactWithBalanceDTO>,
        ): void {
            const firstTwentyContacts = dummyContacts.slice(0, 20);
            const returnedDtosAreTheFirstTwentyContacts = dtos.every(
                dtoIsIn(firstTwentyContacts),
            );

            expect(returnedDtosAreTheFirstTwentyContacts).toBe(true);
        }

        function dtoIsIn(
            contacts: Array<Contact>,
        ): (dto: ContactWithBalanceDTO) => boolean {
            return (dto: ContactWithBalanceDTO) =>
                contacts.some((contact) => contact.getId() === dto.id);
        }
    });

    describe('actor has only contacts with no expense', () => {
        it('should return the contacts with default zero balance', async () => {
            const response = await request(httpServer).get(
                `/${CONTACTS_API_ROUTE}`,
            );

            const dtos = response.body;
            expectAllReturnedDtosToHaveDefaultZeroBalance(dtos);
        });

        function expectAllReturnedDtosToHaveDefaultZeroBalance(
            dtos: Array<ContactWithBalanceDTO>,
        ): void {
            dtos.forEach((dto) => expect(dto.balance).toBe('0,00'));
        }
    });

    describe('actor has a contact with expenses, and another one without', () => {
        let dummyContact: Contact;
        let dummyContactWithExpense: Contact;

        beforeEach(async () => {
            dummyContact = await fixture.setupDefaultUserContact();
            ({ contact: dummyContactWithExpense } =
                await fixture.setupDefaultUserUniqueContactPairExpenses({
                    length: 10,
                }));
        });

        it('should return both contacts', async () => {
            const response = await request(httpServer).get(
                `/${CONTACTS_API_ROUTE}`,
            );

            const dtos = response.body;
            expect(dtos.length).toBe(2);
            expectBothContactsToHaveBeenReturnedIn(dtos);
        });

        function expectBothContactsToHaveBeenReturnedIn(
            dtos: Array<ContactWithBalanceDTO>,
        ): void {
            const bothContacts = [dummyContact, dummyContactWithExpense];
            const bothContactsReturned = bothContacts.every((contact) =>
                dtos.some((dto) => contact.getId() === dto.id),
            );
            expect(bothContactsReturned).toBe(true);
        }
    });

    describe('actor has contacts with expenses', () => {
        type ExpenseBalanceRecord = { expenseId: string; balance: string };
        let expenseBalances: Array<ExpenseBalanceRecord>;

        beforeEach(async () => {
            const expenses = await fixture.setupDefaultUserPairExpenses();
            expenseBalances = expenses.map(mapToExpenseBalanceRecord());
        });

        it('should return the contacts with the right balance', async () => {
            const response = await request(httpServer).get(
                `/${CONTACTS_API_ROUTE}`,
            );

            const dtos = response.body;
            expectAllReturnedDtosToHaveRightBalance(dtos);
        });

        function mapToExpenseBalanceRecord(): (
            value: PairExpense,
        ) => ExpenseBalanceRecord {
            return (expense) => {
                const snapshot = PairExpenseSnapshot.create({
                    expense,
                    perspectiveId: DEFAULT_USER.getId(),
                });
                const balance = snapshot.getPerspectiveBalance();
                return {
                    expenseId: expense.getId(),
                    balance: BalanceDTO.from(balance).getValue(),
                };
            };
        }

        function expectAllReturnedDtosToHaveRightBalance(
            dtos: Array<ContactWithBalanceDTO>,
        ): void {
            dtos.forEach((dto) => {
                const expenseBalance = expenseBalances.find(
                    ({ expenseId }) => expenseId === dto.id,
                );
                expect(dto.balance).toBe(expenseBalance?.balance);
            });
        }
    });
});
