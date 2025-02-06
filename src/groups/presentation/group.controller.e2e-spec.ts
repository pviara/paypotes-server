import { App } from 'supertest/types';
import { ApplicationRunner } from '@test/helpers/application-runner/application-runner';
import {
    bootstrap,
    createOverridingProviderFrom,
    shutdown,
} from '@test/helpers/utils';
import { GroupModule } from '@groups/group.module';
import { GROUPS_API_ROUTE } from '@groups/presentation/group.controller';
import { HttpStatus } from '@nestjs/common';
import { User } from '@users/domain/user';
import {
    UserInMemoryTestingRepository,
    UserTestingRepository,
} from '@test/helpers/user.testing-repository';
import { userRepositoryToken } from '@users/persistence/user-repository.provider';
import * as request from 'supertest';
import { Group } from '@groups/domain/group';
import {
    GroupInMemoryTestingRepository,
    GroupTestingRepository,
} from '@test/helpers/group.testing-repository';
import { groupRepositoryToken } from '@groups/persistence/group.repository-provider';

describe('GroupController', () => {
    const runner = new ApplicationRunner(GroupModule, [
        createOverridingProviderFrom(
            groupRepositoryToken,
            GroupInMemoryTestingRepository,
        ),
        createOverridingProviderFrom(
            userRepositoryToken,
            UserInMemoryTestingRepository,
        ),
    ]);

    let groupRepo: GroupTestingRepository;
    let userRepo: UserTestingRepository;

    const dummyUsers = [
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

    const dummyGroup = new Group({
        id: crypto.randomUUID(),
        name: 'name',
        emoji: '📅',
        members: dummyUsers,
    });

    beforeAll(async () => {
        await runner.bootstrap();

        groupRepo = runner.getGroupRepository();
        userRepo = runner.getUserRepository();
    });

    afterAll(shutdown(runner));

    describe('GET /groups', () => {
        it.each(['id', null, 59391, NaN, undefined])(
            'should return 400 BAD_REQUEST when given param "%s" is not a valid uuid',
            async (param: any) => {
                const httpServer = getHttpServerFromApp();
                const response = await request(httpServer).get(
                    `/${GROUPS_API_ROUTE}/${param}`,
                );

                expect(response.status).toBe(HttpStatus.BAD_REQUEST);
            },
        );

        it('should return the right group', async () => {
            await userRepo.insert(...dummyUsers);
            await groupRepo.insert(dummyGroup);

            const httpServer = getHttpServerFromApp();
            const response = await request(httpServer).get(
                `/${GROUPS_API_ROUTE}/${dummyGroup.getId()}`,
            );

            expect(response.body).toStrictEqual({
                id: dummyGroup.getId(),
                name: dummyGroup.getName(),
                emoji: dummyGroup.getEmoji(),
                members: dummyGroup.getMembers().map((user: User) => ({
                    id: user.getId(),
                    firstname: user.getFirstname(),
                    lastname: user.getLastname(),
                })),
            });
        });
    });

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
                    .get<UserTestingRepository>(userRepositoryToken);

                await userRepo.empty();
                await userRepo.insert(...dummyGroupUsers);
            });

            it('should insert a group in database', async () => {
                const httpServer = getHttpServerFromApp();
                const memberIds = mapIdsFrom(dummyGroupUsers);

                const response = await request(httpServer)
                    .post(`/${GROUPS_API_ROUTE}`)
                    .send({
                        id: crypto.randomUUID(),
                        name: 'name',
                        emoji: '🏕️',
                        memberIds,
                    });

                expect(response.status).toBe(HttpStatus.CREATED);
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
                const userRepo = runner.getUserRepository();
                await userRepo.empty();
                await userRepo.insert(...dummyGroupUsers);
            });

            it('should return 404 NOT_FOUND', async () => {
                const httpServer = getHttpServerFromApp();

                const NOT_EXISTING_ID = crypto.randomUUID();
                const memberIds =
                    mapIdsFrom(dummyGroupUsers).concat(NOT_EXISTING_ID);

                const response = await request(httpServer)
                    .post(`/${GROUPS_API_ROUTE}`)
                    .send({
                        id: crypto.randomUUID(),
                        name: 'name',
                        emoji: '✈️',
                        memberIds,
                    });

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
