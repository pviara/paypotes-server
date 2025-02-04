import { App } from 'supertest/types';
import { ApplicationRunner } from '@test/application-runner';
import { bootstrap, shutdown } from '@test/utils';
import { GroupsModule } from '@groups/groups.module';
import { GROUPS_API_ROUTE } from '@groups/presentation/groups.controller';
import { HttpStatus } from '@nestjs/common';
import * as request from 'supertest';

describe('GroupsController', () => {
    const runner = new ApplicationRunner(GroupsModule);

    beforeAll(bootstrap(runner));
    afterAll(shutdown(runner));

    describe('POST /groups', () => {
        const invalidPayloads = [{}, { a: 'A' }, ''];

        it.each(invalidPayloads)(
            'should return 400 BAD_REQUEST when given payload "%s" is invalid',
            async (payload: NonNullable<unknown>) => {
                const httpServer = runner
                    .getApplication()
                    .getHttpServer() as App;
                const response = await request(httpServer)
                    .post(`/${GROUPS_API_ROUTE}`)
                    .send(payload);

                expect(response.status).toBe(HttpStatus.BAD_REQUEST);
            },
        );

        it('should insert a group in database', async () => {
            const httpServer = runner.getApplication().getHttpServer() as App;
            const response = await request(httpServer)
                .post(`/${GROUPS_API_ROUTE}`)
                .send({});

            expect(response.status).toBe(HttpStatus.CREATED);
        });
    });
});
