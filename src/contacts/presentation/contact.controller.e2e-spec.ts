import { App } from 'supertest/types';
import { Contact } from '@contacts/domain/contact';
import { ContactWithBalanceDTO } from '@contacts/presentation/dto/contact-with-balance.dto';
import { ContactInMemoryTestingRepository } from '@test/helpers/contact/contact.testing-repository';
import {
    contactSpecModules as modules,
    contactSpecProviders as providers,
    generateDefaultUserRelationship,
    generateDefaultUserRelationships,
    generateRandomContacts,
} from '@test/helpers/contact/utils';
import { CONTACTS_API_ROUTE } from '@contacts/presentation/contact.controller';
import { convertCents, shutdown } from '@test/helpers/utils';
import { DEFAULT_USER } from '@test/doubles/auth/default-user';
import { ExpenseInMemoryTestingRepository } from '@test/helpers/expense/expense.testing-repository';
import {
    generateDefaultUserPairExpenses,
    generateRandomMetadata,
} from '@test/helpers/expense/utils';
import { HttpStatus } from '@nestjs/common';
import { initRunnerWith } from '@test/helpers/application-runner/utils';
import { PairExpense, PairPayment } from '@expenses/domain/pair-expense';
import { Stakeholder } from '@expenses/domain/stakeholder';
import * as request from 'supertest';

describe('ContactController', () => {
    const runner = initRunnerWith(modules, providers);

    let contactRepo: ContactInMemoryTestingRepository;
    let expenseRepo: ExpenseInMemoryTestingRepository;
    let httpServer: App;

    beforeEach(async () => {
        await runner.bootstrap();

        contactRepo = runner.getRepository('contact');
        expenseRepo = runner.getRepository('expense');
        httpServer = runner.getHttpServer();
    });

    afterEach(shutdown(runner));

    describe('GET /contacts', () => {
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
                dummyContacts = generateRandomContacts({ length: 40 });

                const dummyRelationships = generateDefaultUserRelationships({
                    contacts: dummyContacts,
                });

                await contactRepo.empty();
                await contactRepo.insert(...dummyRelationships);
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

            describe('actor has contacts with expenses', () => {
                beforeEach(async () => {
                    const expenses = dummyContacts.flatMap((contact) => {
                        const stakeholder = Stakeholder.fromContact(contact);
                        return [
                            createRandomCreditExpenseFor(stakeholder, 894),
                            createRandomDebitExpenseFor(stakeholder, 145),
                            createRandomDebitExpenseFor(stakeholder, 311),
                            createRandomCreditExpenseFor(stakeholder, 28),
                        ];
                    });

                    await expenseRepo.empty();
                    await expenseRepo.insert(...expenses);
                });

                it('should return the contacts with the right balance', async () => {
                    const response = await request(httpServer).get(
                        `/${CONTACTS_API_ROUTE}`,
                    );

                    const dtos = response.body;
                    expectAllReturnedDtosToHaveRightBalance(dtos);
                });

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

                function expectAllReturnedDtosToHaveRightBalance(
                    dtos: Array<ContactWithBalanceDTO>,
                ): void {
                    const balance = 894 - 145 - 311 + 28;
                    const expected = `${convertCents(balance)}`.replace(
                        '.',
                        ',',
                    );
                    dtos.forEach((dto) => expect(dto.balance).toBe(expected));
                }
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
    });

    describe('GET /contacts/:id', () => {
        let dummyContact: Contact;

        beforeEach(async () => {
            const dummyRelationship = generateDefaultUserRelationship();
            await contactRepo.insert(dummyRelationship);

            dummyContact = dummyRelationship.userB;
        });

        const invalidIds = ['id', null, 59391, NaN, undefined];
        it.each(invalidIds)(
            'should return 400 BAD_REQUEST when given param "%s" is not a valid uuid',
            async (id: unknown) => {
                const response = await request(httpServer).get(
                    `/${CONTACTS_API_ROUTE}/${id}`,
                );

                expect(response.status).toBe(HttpStatus.BAD_REQUEST);
            },
        );

        describe('actor has no expense with contact', () => {
            it('should return default balance "0,00"', async () => {
                const response = await request(httpServer).get(
                    `/${CONTACTS_API_ROUTE}/${dummyContact.getId()}`,
                );

                expect(response.body.id).toBe(dummyContact.getId());
                expect(response.body.firstname).toBe(
                    dummyContact.getFirstname(),
                );
                expect(response.body.lastname).toBe(dummyContact.getLastname());
                expect(response.body.balance).toBe('0,00');
            });
        });

        describe('actor has expenses with contact', () => {
            let dummyContactExpenses: Array<PairExpense>;

            beforeEach(async () => {
                const counterparty = Stakeholder.fromContact(dummyContact);
                dummyContactExpenses = generateDefaultUserPairExpenses({
                    length: 40,
                    counterparty,
                });
                await expenseRepo.empty();
                await expenseRepo.insert(...dummyContactExpenses);
            });

            it('should return the right balance', async () => {
                const response = await request(httpServer).get(
                    `/${CONTACTS_API_ROUTE}/${dummyContact.getId()}`,
                );

                const balance = computeActorDummyContactBalance();
                const expected = `${convertCents(balance)}`.replace('.', ',');

                expect(response.body.balance).toBe(expected);
            });

            function computeActorDummyContactBalance(): number {
                return dummyContactExpenses.reduce(
                    computeExpenseBalanceFor(DEFAULT_USER.getId()),
                    0,
                );
            }

            function computeExpenseBalanceFor(
                actorId: string,
            ): (balance: number, expense: PairExpense) => number {
                return (balance, expense) => {
                    const expenseBalance = expense.getRawBalance();
                    const actorBalance = expense.hasCreditor(actorId)
                        ? expenseBalance
                        : -expenseBalance;

                    return balance + actorBalance;
                };
            }
        });
    });

    describe('GET /contacts/without-balance', () => {
        describe('actor has no contact', () => {
            it('should return an empty array', async () => {
                const response = await request(httpServer).get(
                    `/${CONTACTS_API_ROUTE}/without-balance`,
                );

                expect(response.status).toBe(HttpStatus.OK);
                expect(response.body.length).toBe(0);
            });
        });

        describe('actor has contacts', () => {
            let dummyContacts: Array<Contact>;

            beforeEach(async () => {
                dummyContacts = generateRandomContacts({ length: 40 });

                const dummyRelationships = generateDefaultUserRelationships({
                    contacts: dummyContacts,
                });

                await contactRepo.empty();
                await contactRepo.insert(...dummyRelationships);
            });

            it('should return the first 20 contacts by default', async () => {
                const response = await request(httpServer).get(
                    `/${CONTACTS_API_ROUTE}/without-balance`,
                );

                const dtos = response.body;
                expect(dtos.length).toBe(20);
                expectReturnedDtosToBeTheFirstTwentyContacts(dtos);
            });

            describe('page index has been given', () => {
                it('should return the second 20 contacts when given index is 1', async () => {
                    const response = await request(httpServer).get(
                        `/${CONTACTS_API_ROUTE}/without-balance?pageIndex=1`,
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
                        `/${CONTACTS_API_ROUTE}/without-balance?search=${targetContact.getFirstname()}`,
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
    });
});
