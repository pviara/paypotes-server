import { App } from 'supertest/types';
import { HttpStatus } from '@nestjs/common';
import { initRunnerWith } from '@test/helpers/application-runner/utils';
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
    const runner = initRunnerWith(modules, providers);

    let userRepo: UserInMemoryTestingRepository;
    let httpServer: App;

    beforeEach(async () => {
        await runner.bootstrap();
        userRepo = runner.getRepository('user');
        httpServer = runner.getHttpServer();
    });

    afterEach(shutdown(runner));

    describe('GET /user/:phone', () => {
        const invalidPhones = [null, undefined, '067845 6633', 'abc'];

        it.each(invalidPhones)(
            'should return 400 BAD_REQUEST when given phone param "%s" is not valid',
            async (phone: unknown) => {
                const response = await request(httpServer).get(
                    `/${USERS_API_ROUTE}/${phone}`,
                );
                expect(response.status).toBe(HttpStatus.BAD_REQUEST);
            },
        );

        it('should return the right user for given phone', async () => {
            const dummyUser = generateRandomUser();
            await userRepo.insert(dummyUser);

            const response = await request(httpServer).get(
                `/${USERS_API_ROUTE}/${dummyUser.getPhone()}`,
            );

            expect(response.status).toBe(HttpStatus.OK);
            expect(response.body).toStrictEqual(raw(UserDTO.from(dummyUser)));
        });
    });
});
