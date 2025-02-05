import { App } from 'supertest/types';
import { ApplicationRunner, OverriddenType } from '@test/application-runner';
import { bootstrap, shutdown } from '@test/utils';
import { GroupModule } from '@groups/group.module';
import { GROUPS_API_ROUTE } from '@groups/presentation/group.controller';
import { HttpStatus } from '@nestjs/common';
import { User } from '@users/domain/user';
import {
    UserInMemoryTestingRepository,
    UserTestingRepository,
} from '@test/persistence/user.testing-repository';
import { UserRepositoryToken } from '@users/persistence/user.repository-provider';
import * as request from 'supertest';

describe('GroupController', () => {
    const runner = new ApplicationRunner(GroupModule, [
        {
            overridingClass: UserInMemoryTestingRepository,
            overriddenToken: UserRepositoryToken,
            overriddenType: OverriddenType.Provider,
        },
    ]);

    beforeAll(bootstrap(runner));
    afterAll(shutdown(runner));

    describe('POST /groups', () => {
        const invalidPayloads = [
            {},
            { a: 'A' },
            '',
            {},
            {
                name: 'name',
                emoji: '',
                memberIds: [],
            },
            {
                name: 'name',
                emoji: '📦',
                memberIds: [],
            },
            {
                name: 'name',
                emoji: '📦',
                memberIds: ['invalid_uuid'],
            },
        ];

        it.each(invalidPayloads)(
            'should return 400 BAD_REQUEST when given payload "%s" is invalid',
            async (payload: NonNullable<unknown>) => {
                const httpServer = getHttpServerFromApp();
                const response = await request(httpServer)
                    .post(`/${GROUPS_API_ROUTE}`)
                    .send(payload);

                expect(response.status).toBe(HttpStatus.BAD_REQUEST);
            },
        );

        describe('all group users exist', () => {
            const dummyGroupUsers: Array<User> = [
                new User({
                    id: crypto.randomUUID(),
                    firstname: 'A',
                    lastname: 'a',
                }),
                new User({
                    id: crypto.randomUUID(),
                    firstname: 'B',
                    lastname: 'b',
                }),
                new User({
                    id: crypto.randomUUID(),
                    firstname: 'C',
                    lastname: 'c',
                }),
            ];

            beforeEach(async () => {
                const userRepo = runner
                    .getApplication()
                    .get<UserTestingRepository>(UserRepositoryToken);

                await userRepo.empty();
                await userRepo.insert(...dummyGroupUsers);
            });

            it('should insert a group in database', async () => {
                const httpServer = getHttpServerFromApp();
                const memberIds = mapIdsFrom(dummyGroupUsers);

                const response = await request(httpServer)
                    .post(`/${GROUPS_API_ROUTE}`)
                    .send({
                        name: 'name',
                        emoji: '🏕️',
                        memberIds,
                    });

                expect(response.status).toBe(HttpStatus.CREATED);
                // todo: check that group was created
            });
        });

        describe("some group users don't exist", () => {
            const dummyGroupUsers: Array<User> = [
                new User({
                    id: crypto.randomUUID(),
                    firstname: 'A',
                    lastname: 'a',
                }),
                new User({
                    id: crypto.randomUUID(),
                    firstname: 'B',
                    lastname: 'b',
                }),
            ];

            beforeEach(async () => {
                const userRepo = runner
                    .getApplication()
                    .get<UserTestingRepository>(UserRepositoryToken);

                await userRepo.empty();
                await userRepo.insert(...dummyGroupUsers);
            });

            it('should return 404 NOT NOT_FOUND', async () => {
                const httpServer = getHttpServerFromApp();

                const NOT_EXISTING_ID = crypto.randomUUID();
                const memberIds =
                    mapIdsFrom(dummyGroupUsers).concat(NOT_EXISTING_ID);

                const response = await request(httpServer)
                    .post(`/${GROUPS_API_ROUTE}`)
                    .send({ memberIds });

                expect(response.status).toBe(HttpStatus.NOT_FOUND);
            });
        });

        function mapIdsFrom(dummyGroupUsers: Array<User>): Array<string> {
            return dummyGroupUsers.map((user: User) => user.getId());
        }
    });

    function getHttpServerFromApp(): App {
        return runner.getApplication().getHttpServer() as App;
    }
});
