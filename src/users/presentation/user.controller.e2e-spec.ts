import { App } from 'supertest/types';
import { DEFAULT_USER } from '@test/doubles/auth/default-user';
import { HttpStatus } from '@nestjs/common';
import { initApplicationWith } from '@test/helpers/application/utils';
import { raw, shutdown } from '@test/helpers/utils';
import { UserDTO } from '@users/presentation/dto/user.dto';
import { UserInMemoryTestingRepository } from '@test/helpers/user/user.testing-repository';
import {
    userSpecModules as modules,
    userSpecProviders as providers,
    generateRandomUser,
} from '@test/helpers/user/utils';
import { USERS_API_ROUTE } from '@users/presentation/user.controller';
import * as request from 'supertest';

describe('UserController', () => {
    const application = initApplicationWith(modules, providers);

    let userRepo: UserInMemoryTestingRepository;
    let httpServer: App;

    beforeEach(async () => {
        await application.bootstrap();
        userRepo = application.getRepository('user');
        httpServer = application.getHttpServer();
    });

    afterEach(shutdown(application));

    describe('GET /user/:name', () => {
        const invalidStrings = ['580940', 'test3104', '@', '___'];

        it.each(invalidStrings)(
            'should return 400 BAD_REQUEST when given name param "%s" is not valid',
            async (name: unknown) => {
                const response = await request(httpServer).get(
                    `/${USERS_API_ROUTE}?name=${name}`,
                );
                expect(response.status).toBe(HttpStatus.BAD_REQUEST);
            },
        );

        it('should return the right user for given name', async () => {
            const dummyUser = generateRandomUser();
            await userRepo.insert(dummyUser);

            const response = await request(httpServer).get(
                `/${USERS_API_ROUTE}?name=${dummyUser.getFirstname()}`,
            );

            expect(response.status).toBe(HttpStatus.OK);
            expect(response.body).toContainEqual(raw(UserDTO.from(dummyUser)));
        });

        describe('actor tries to fetch theirself', () => {
            it('should not return current actor in the list', async () => {
                await userRepo.insert(DEFAULT_USER);

                const response = await request(httpServer).get(
                    `/${USERS_API_ROUTE}?name=${DEFAULT_USER.getFirstname()}`,
                );

                expect(response.body.length).toBe(0);
            });
        });
    });
});
