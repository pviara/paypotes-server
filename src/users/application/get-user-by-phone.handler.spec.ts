import { generateRandomUser } from '@test/helpers/user/utils';
import {
    GetUserByPhoneHandler,
    GetUserByPhoneQuery,
    UserNotFoundError,
} from '@users/application/get-user-by-phone.handler';
import { UserRepositorySpy } from '@test/doubles/user-repository.spy';

describe('GetUserByPhoneHandler', () => {
    let sut: GetUserByPhoneHandler;
    let userRepo: UserRepositorySpy;

    const dummyQuery = new GetUserByPhoneQuery({ phone: '0647896642' });
    const dummyUser = generateRandomUser();

    beforeEach(() => {
        userRepo = new UserRepositorySpy();
        sut = new GetUserByPhoneHandler(userRepo);

        userRepo.stub('getByPhone', dummyUser);
    });

    it('should retrieve the user by its phone', async () => {
        await sut.execute(dummyQuery);

        expect(userRepo.calls.getByPhone.count).toBe(1);
        expect(userRepo.calls.getByPhone.history).toContain(
            dummyQuery.payload.phone,
        );
    });

    it('should return the user that was retrieved', async () => {
        const result = await sut.execute(dummyQuery);
        expect(result).toStrictEqual(dummyUser);
    });

    describe("user doesn't exist", () => {
        it('should throw an error', async () => {
            userRepo.stub('getByPhone', null);
            await expect(sut.execute(dummyQuery)).rejects.toThrow(
                UserNotFoundError,
            );
        });
    });
});
