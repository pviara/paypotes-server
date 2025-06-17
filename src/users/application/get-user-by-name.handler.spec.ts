import { generateRandomUsers } from '@test/helpers/user/utils';
import {
    GetUserByNameHandler,
    GetUserByNameQuery,
} from '@users/application/get-user-by-name.handler';
import { UserRepositorySpy } from '@test/doubles/user-repository.spy';

describe('GetUserByNameHandler', () => {
    let sut: GetUserByNameHandler;
    let userRepo: UserRepositorySpy;

    const dummyQuery = new GetUserByNameQuery({ name: 'Charlie' });
    const dummyUsers = generateRandomUsers({ length: 3 });

    beforeEach(() => {
        userRepo = new UserRepositorySpy();
        sut = new GetUserByNameHandler(userRepo);

        userRepo.stub('getByName', dummyUsers);
    });

    it('should retrieve the users by their names', async () => {
        await sut.execute(dummyQuery);

        expect(userRepo.calls.getByName.count).toBe(1);
        expect(userRepo.calls.getByName.history).toContain(
            dummyQuery.payload.name,
        );
    });

    it('should return the users that were retrieved', async () => {
        const result = await sut.execute(dummyQuery);
        expect(result).toStrictEqual(dummyUsers);
    });
});
