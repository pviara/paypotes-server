import { App } from 'supertest/types';
import {
    generateRandomGroup,
    generateRandomGroups,
    generateRandomUsers,
    mapIdsFrom,
    shutdown,
} from '@test/helpers/utils';
import {
    groupSpecModules as modules,
    groupSpecProviders as providers,
} from '@test/helpers/group/utils';
import { GroupTestingRepository } from '@test/helpers/group/group.testing-repository';
import { GROUPS_API_ROUTE } from '@groups/presentation/group.controller';
import { HttpStatus } from '@nestjs/common';
import { initRunnerWith } from '@test/helpers/application-runner/utils';
import { User } from '@users/domain/user';
import { UserTestingRepository } from '@test/helpers/user/user.testing-repository';
import * as request from 'supertest';

describe('GroupController', () => {
    const runner = initRunnerWith(modules, providers);

    let groupRepo: GroupTestingRepository;
    let userRepo: UserTestingRepository;
    let httpServer: App;

    const dummyUsers = generateRandomUsers();
    const dummyGroup = generateRandomGroup({ members: dummyUsers });

    beforeAll(async () => {
        await runner.bootstrap();

        groupRepo = runner.getGroupRepository();
        userRepo = runner.getUserRepository();
        httpServer = runner.getHttpServer();
    });

    afterAll(shutdown(runner));

    describe('GET /groups', () => {
        describe('no group exists', () => {
            it('should return an empty array', async () => {
                const response = await request(httpServer).get(
                    `/${GROUPS_API_ROUTE}`,
                );

                expect(response.status).toBe(HttpStatus.OK);
                expect(response.body.length).toBe(0);
            });
        });

        describe('some groups exist', () => {
            beforeEach(() => {
                const dummyGroups = generateRandomGroups({ length: 50 });
                groupRepo.insert(...dummyGroups);
            });

            it('should return the first 20 groups by default', async () => {
                const response = await request(httpServer).get(
                    `/${GROUPS_API_ROUTE}`,
                );

                expect(response.body.length).toBe(20);
            });
        });
    });

    describe('GET /groups/:id', () => {
        const invalidIds = ['id', null, 59391, NaN, undefined];

        it.each(invalidIds)(
            'should return 400 BAD_REQUEST when given param "%s" is not a valid uuid',
            async (id: unknown) => {
                const response = await request(httpServer).get(
                    `/${GROUPS_API_ROUTE}/${id}`,
                );

                expect(response.status).toBe(HttpStatus.BAD_REQUEST);
            },
        );

        it('should return the right group for given id', async () => {
            await userRepo.insert(...dummyGroup.getMembers());
            await groupRepo.insert(dummyGroup);

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
        const dummyGroupMembers = generateRandomUsers();
        const invalidPayloads: NonNullable<unknown>[] = [
            '',
            {},
            { a: 'A' },
            { name: 'name', emoji: '', memberIds: [] },
            { name: 'name', emoji: '📦', memberIds: [] },
            { name: 'name', emoji: '📦', memberIds: ['invalid_uuid'] },
        ];

        it.each(invalidPayloads)(
            'should return 400 BAD_REQUEST when given payload "%s" is invalid',
            async (payload: NonNullable<unknown>) => {
                const response = await request(httpServer)
                    .post(`/${GROUPS_API_ROUTE}`)
                    .send(payload);

                expect(response.status).toBe(HttpStatus.BAD_REQUEST);
            },
        );

        describe("all of group's users exist", () => {
            beforeEach(async () => {
                await userRepo.empty();
                await userRepo.insert(...dummyGroupMembers);
            });

            it('should insert a group in database', async () => {
                const groupId = crypto.randomUUID();
                const memberIds = mapIdsFrom(dummyGroupMembers);

                const response = await request(httpServer)
                    .post(`/${GROUPS_API_ROUTE}`)
                    .send({
                        id: groupId,
                        name: 'name',
                        emoji: '🏕️',
                        memberIds,
                    });

                expect(response.status).toBe(HttpStatus.CREATED);
                expect(groupRepo.groupSaved(groupId)).toBe(true);
            });
        });

        describe("some of group's users don't exist", () => {
            beforeEach(async () => {
                await userRepo.empty();
                await userRepo.insert(...dummyGroupMembers);
            });

            it('should return 404 NOT_FOUND', async () => {
                const NOT_EXISTING_ID = crypto.randomUUID();
                const memberIds = [
                    ...mapIdsFrom(dummyGroupMembers),
                    NOT_EXISTING_ID,
                ];

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
    });
});
