import { App } from 'supertest/types';
import { Balance } from '@expenses/domain/balance/balance';
import { Contact } from '@contacts/domain/contact';
import { contactSpecModules as modules } from '@test/helpers/contact/utils';
import { CONTACTS_API_ROUTE } from '@contacts/presentation/contact.controller';
import { convertCents, empty, shutdown } from '@test/helpers/utils';
import { DEFAULT_USER } from '@test/doubles/auth/default-user';
import { EXPENSES_API_ROUTE } from '@expenses/presentation/expense.controller';
import { Fixture } from '@test/helpers/fixture';
import { HttpStatus } from '@nestjs/common';
import { initApplicationWith } from '@test/helpers/application/utils';
import { PairExpense } from '@expenses/domain/expense/pair/pair-expense';
import * as request from 'supertest';

describe('getActorContactWithBalanceById', () => {
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

    describe('given id is invalid', () => {
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
    });

    describe("actor's contact does not exist", () => {
        it('should return 404 NOT_FOUND', async () => {
            const NOT_EXISTING_ID = crypto.randomUUID();

            const response = await request(httpServer).get(
                `/${CONTACTS_API_ROUTE}/${NOT_EXISTING_ID}`,
            );

            expect(response.status).toBe(HttpStatus.NOT_FOUND);
        });
    });

    describe("actor's contact exists", () => {
        let dummyContact: Contact;

        beforeEach(async () => {
            dummyContact = await fixture.setupDefaultUserContact();
        });

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
                ({ contact: dummyContact, expenses: dummyContactExpenses } =
                    await fixture.setupDefaultUserUniqueContactPairExpenses());
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
                        await request(httpServer).put(
                            `/${EXPENSES_API_ROUTE}/pair/${dummyContact.getId()}/${expense.getId()}`,
                        );
                    }
                }
            });

            function computeActorDummyContactBalance(): number {
                return Balance.calculate({
                    expenses: dummyContactExpenses,
                    stakeholderId: DEFAULT_USER.getId(),
                });
            }
        });
    });
});
