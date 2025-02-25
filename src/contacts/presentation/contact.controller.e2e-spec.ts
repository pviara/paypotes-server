import { App } from 'supertest/types';
import { AUTHENTICATED_USER } from '@test/doubles/auth/authenticated-user';
import { Contact } from '@contacts/domain/contact';
import { ContactDTO } from '@contacts/presentation/dto/contact.dto';
import { ContactInMemoryTestingRepository } from '@test/helpers/contact/contact.testing-repository';
import {
    contactSpecModules as modules,
    contactSpecProviders as providers,
    generateRandomContacts,
    generateRandomContact,
} from '@test/helpers/contact/utils';
import { CONTACTS_API_ROUTE } from './contact.controller';
import { HttpStatus } from '@nestjs/common';
import { initRunnerWith } from '@test/helpers/application-runner/utils';
import { shutdown } from '@test/helpers/utils';
import * as request from 'supertest';

describe('ContactController', () => {
    const runner = initRunnerWith(modules, providers);

    let contactRepo: ContactInMemoryTestingRepository;
    let httpServer: App;

    const dummyActorId = AUTHENTICATED_USER.getId();

    beforeAll(async () => {
        await runner.bootstrap();

        contactRepo = runner.getContactRepository();
        httpServer = runner.getHttpServer();
    });

    afterAll(shutdown(runner));

    describe('GET /contacts', () => {
        describe('no contact exists', () => {
            it('should return an empty array', async () => {
                const response = await request(httpServer).get(
                    `/${CONTACTS_API_ROUTE}`,
                );

                expect(response.status).toBe(HttpStatus.OK);
                expect(response.body.length).toBe(0);
            });
        });

        describe('some contacts exist', () => {
            let dummyContacts: Array<Contact>;

            beforeEach(async () => {
                dummyContacts = generateRandomContacts({ length: 40 });

                await contactRepo.empty();
                await contactRepo.insert(dummyActorId, ...dummyContacts);
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
                    dtos: Array<ContactDTO>,
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

                    expect(response.body[0].id).toBe(targetContact.getId());
                });
            });

            function expectReturnedDtosToBeTheFirstTwentyContacts(
                dtos: Array<ContactDTO>,
            ): void {
                const firstTwentyContacts = dummyContacts.slice(0, 20);
                const returnedDtosAreTheFirstTwentyContacts = dtos.every(
                    dtoIsIn(firstTwentyContacts),
                );

                expect(returnedDtosAreTheFirstTwentyContacts).toBe(true);
            }

            function dtoIsIn(
                contacts: Array<Contact>,
            ): (dto: ContactDTO) => boolean {
                return (dto: ContactDTO) =>
                    contacts.some((contact) => contact.getId() === dto.id);
            }
        });
    });

    describe('GET /contacts/:id', () => {
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

        it('should return the right contact for given id', async () => {
            const dummyContact = generateRandomContact();
            await contactRepo.insert(dummyActorId, dummyContact);

            const response = await request(httpServer).get(
                `/${CONTACTS_API_ROUTE}/${dummyContact.getId()}`,
            );

            expect(response.body).toStrictEqual({
                id: dummyContact.getId(),
                firstname: dummyContact.getFirstname(),
                lastname: dummyContact.getLastname(),
            });
        });
    });
});
