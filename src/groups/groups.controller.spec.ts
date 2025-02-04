import { App } from 'supertest/types';
import { ApplicationRunner } from '@test/application-runner';
import { bootstrap, shutdown } from '@test/utils';
import { GroupsModule } from './groups.module';
import * as request from 'supertest';

describe('GroupsController', () => {
    const runner = new ApplicationRunner(GroupsModule);

    beforeAll(bootstrap(runner));
    afterAll(shutdown(runner));

    describe('POST /groups', () => {
        it('should insert a group in database', async () => {
            const httpServer = runner.getApplication().getHttpServer() as App;
            const response = await request(httpServer)
                .post('/api/groups')
                .send({});

            expect(response.status).toBe(201);
        });
    });
});
