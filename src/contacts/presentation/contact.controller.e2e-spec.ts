import { App } from 'supertest/types';
import { Calculator } from '@expenses/domain/calculator';
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
import { EXPENSES_API_ROUTE } from '@expenses/presentation/expense.controller';
import {
    generateDefaultUserPairExpenses,
    generateRandomMetadata,
} from '@test/helpers/expense/utils';
import { HttpStatus } from '@nestjs/common';
import { initApplicationWith } from '@test/helpers/application/utils';
import { mapUserFrom } from '@test/helpers/user/utils';
import { PairExpense, PairPayment } from '@expenses/domain/pair-expense';
import { User } from '@users/domain/user';
import * as request from 'supertest';

describe('ContactController', () => {
    const application = initApplicationWith(modules, providers);

    let contactRepo: ContactInMemoryTestingRepository;
    let expenseRepo: ExpenseInMemoryTestingRepository;
    let httpServer: App;

    beforeEach(async () => {
        await application.bootstrap();

        contactRepo = application.getRepository('contact');
        expenseRepo = application.getRepository('expense');
        httpServer = application.getHttpServer();
    });

    afterEach(shutdown(application));

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
                        const user = mapUserFrom(contact);
                        return [
                            createRandomCreditExpenseFor(user, 894),
                            createRandomDebitExpenseFor(user, 158),
                            createRandomDebitExpenseFor(user, 310),
                            createRandomCreditExpenseFor(user, 28),
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

                function expectAllReturnedDtosToHaveRightBalance(
                    dtos: Array<ContactWithBalanceDTO>,
                ): void {
                    const balance = 894 / 2 - 158 / 2 - 310 / 2 + 28 / 2;
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
                expect(response.body.avatarUrl).toBe(
                    dummyContact.getAvatarUrl(),
                );
                expect(response.body.balance).toBe('0,00');
            });
        });

        describe('actor has expenses with contact', () => {
            let dummyContactExpenses: Array<PairExpense>;

            beforeEach(async () => {
                dummyContactExpenses = generateDefaultUserPairExpenses({
                    length: 40,
                    counterparty: mapUserFrom(dummyContact),
                });
                await expenseRepo.empty();
                await expenseRepo.insert(...dummyContactExpenses);
            });

            it('should return the right balance', async () => {
                const response = await request(httpServer).get(
                    `/${CONTACTS_API_ROUTE}/${dummyContact.getId()}`,
                );

                const balance = computeActorDummyContactBalance();
                const expected = `${convertCents(balance).toFixed(2)}`.replace(
                    '.',
                    ',',
                );

                expect(response.body.balance).toBe(expected);
            });

            describe('actor expenses have all been settled', () => {
                beforeEach(async () => {
                    await paybackAllExpenses();
                });

                it('should return nil balance', async () => {
                    const response = await request(httpServer).get(
                        `/${CONTACTS_API_ROUTE}/${dummyContact.getId()}`,
                    );
                    expect(response.body.balance).toBe('0,00');
                });

                async function paybackAllExpenses(): Promise<void> {
                    for (const expense of dummyContactExpenses) {
                        const res = await request(httpServer).put(
                            `/${EXPENSES_API_ROUTE}/pair/${dummyContact.getId()}/${expense.getId()}`,
                        );
                    }
                }
            });

            function computeActorDummyContactBalance(): number {
                return new Calculator(dummyContactExpenses).calculateFor(
                    DEFAULT_USER.getId(),
                );
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
