import { initRunnerWith } from '@test/helpers/application-runner/utils';
import {
    contactSpecModules as modules,
    contactSpecProviders as providers,
} from '@test/helpers/contact/utils';

describe('ContactController', () => {
    const runner = initRunnerWith(modules, providers);
});
