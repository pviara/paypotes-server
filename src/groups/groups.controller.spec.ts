import { ApplicationRunner } from '../../test/application-runner';
import { GroupsModule } from './groups.module';

describe('GroupsController', () => {
    const runner = new ApplicationRunner(GroupsModule);
});
