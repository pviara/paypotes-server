import { App } from 'supertest/types';
import { Contact } from '@contacts/domain/contact';
import { ContactWithBalanceDTO } from '../dto/contact-with-balance.dto';
import { CONTACTS_API_ROUTE } from '@contacts/presentation/contact.controller';
import { empty, shutdown } from '@test/helpers/utils';
import { Fixture } from '@test/helpers/fixture';
import { contactSpecModules as modules } from '@test/helpers/contact/utils';
import { HttpStatus } from '@nestjs/common';
import { initApplicationWith } from '@test/helpers/application/utils';
import * as request from 'supertest';

describe('getActorContactsWithoutBalance', () => {
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
                `/${CONTACTS_API_ROUTE}/without-balance`,
            );

            expect(response.status).toBe(HttpStatus.OK);
            expect(response.body.length).toBe(0);
        });
    });

    describe('actor has contacts', () => {
        let dummyContacts: Array<Contact>;

        beforeEach(async () => {
            dummyContacts = await fixture.setupDefaultUserContacts({
                length: 40,
            });
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
