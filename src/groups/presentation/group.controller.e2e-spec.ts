import { App } from 'supertest/types';
import { mapIdsFrom, shutdown } from '@test/helpers/utils';
import { Group } from '@groups/domain/group';
import { GroupDTO } from '@groups/presentation/dto/group.dto';
import {
    generateDefaultUserRandomGroup,
    generateDefaultUserRandomGroups,
    groupSpecModules as modules,
    groupSpecProviders as providers,
} from '@test/helpers/group/utils';
import { generateRandomUsers } from '@test/helpers/user/utils';
import { GroupInMemoryTestingRepository } from '@test/helpers/group/group.testing-repository';
import { GROUPS_API_ROUTE } from '@groups/presentation/group.controller';
import { HttpStatus } from '@nestjs/common';
import { initRunnerWith } from '@test/helpers/application-runner/utils';
import { User } from '@users/domain/user';
import { UserInMemoryTestingRepository } from '@test/helpers/user/user.testing-repository';
import * as request from 'supertest';

describe('GroupController', () => {
    const runner = initRunnerWith(modules, providers);

    let groupRepo: GroupInMemoryTestingRepository;
    let userRepo: UserInMemoryTestingRepository;
    let httpServer: App;

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
            let dummyGroups: Array<Group>;

            beforeEach(() => {
                dummyGroups = generateDefaultUserRandomGroups({
                    length: 40,
                });

                groupRepo.empty();
                groupRepo.insert(...dummyGroups);
            });

            it('should return the first 20 groups by default', async () => {
                const response = await request(httpServer).get(
                    `/${GROUPS_API_ROUTE}`,
                );

                const dtos = response.body;
                expect(dtos.length).toBe(20);
                expectReturnedDtosToBeTheFirstTwentyGroups(dtos);
            });

            describe('page index has been given', () => {
                it('should return the second 20 groups when given index is 1', async () => {
                    const response = await request(httpServer).get(
                        `/${GROUPS_API_ROUTE}?pageIndex=1`,
                    );

                    const dtos = response.body;
                    expect(dtos.length).toBe(20);
                    expectReturnedDtosToBeTheSecondTwentyGroups(dtos);
                });

                function expectReturnedDtosToBeTheSecondTwentyGroups(
                    dtos: Array<GroupDTO>,
                ): void {
                    const secondTwentyGroups = dummyGroups.slice(20, 40);
                    const returnedDtosAreTheSecondTwentyGroups = dtos.every(
                        dtoIsIn(secondTwentyGroups),
                    );

                    expect(returnedDtosAreTheSecondTwentyGroups).toBe(true);
                }
            });

            describe('search has been given', () => {
                it('should return the groups that match the search', async () => {
                    const targetGroup = dummyGroups[0];
                    const search = targetGroup.getName();

                    const response = await request(httpServer).get(
                        `/${GROUPS_API_ROUTE}?search=${search}`,
                    );

                    expect(response.body.length).toBe(1);
                    expect(response.body[0].id).toBe(targetGroup.getId());
                });
            });

            function expectReturnedDtosToBeTheFirstTwentyGroups(
                dtos: Array<GroupDTO>,
            ): void {
                const firstTwentyGroups = dummyGroups.slice(0, 20);
                const returnedDtosAreTheFirstTwentyGroups = dtos.every(
                    dtoIsIn(firstTwentyGroups),
                );

                expect(returnedDtosAreTheFirstTwentyGroups).toBe(true);
            }

            function dtoIsIn(groups: Array<Group>): (dto: GroupDTO) => boolean {
                return (dto: GroupDTO) =>
                    groups.some((group) => group.getId() === dto.id);
            }
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
            const dummyGroup = generateDefaultUserRandomGroup();
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

        describe('all group members exist', () => {
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

        describe("some group members don't exist", () => {
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
