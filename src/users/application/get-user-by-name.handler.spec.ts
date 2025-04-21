import { generateRandomUser } from '@test/helpers/user/utils';
import {
    GetUserByNameHandler,
    GetUserByNameQuery,
    UserNotFoundWithNameError,
} from '@users/application/get-user-by-name.handler';
import { UserRepositorySpy } from '@test/doubles/user-repository.spy';

describe('GetUserByNameHandler', () => {
    let sut: GetUserByNameHandler;
    let userRepo: UserRepositorySpy;

    const dummyQuery = new GetUserByNameQuery({ name: 'Charlie' });
    const dummyUser = generateRandomUser();

    beforeEach(() => {
        userRepo = new UserRepositorySpy();
        sut = new GetUserByNameHandler(userRepo);

        userRepo.stub('getByName', dummyUser);
    });

    it('should retrieve the user by their name', async () => {
        await sut.execute(dummyQuery);

        expect(userRepo.calls.getByName.count).toBe(1);
        expect(userRepo.calls.getByName.history).toContain(
            dummyQuery.payload.name,
        );
    });

    it('should return the user that was retrieved', async () => {
        const result = await sut.execute(dummyQuery);
        expect(result).toStrictEqual(dummyUser);
    });

    describe("user doesn't exist", () => {
        it('should throw an error', async () => {
            userRepo.stub('getByName', null);
            await expect(sut.execute(dummyQuery)).rejects.toThrow(
                UserNotFoundWithNameError,
            );
        });
    });
});
