import { initMessagingRunnerWith } from '@test/helpers/application-runner/utils';
import { Modules } from '@test/helpers/application-runner/model/module';
import { OverridingProviders } from '@test/helpers/application-runner/model/overriding-provider';
import { shutdown } from '@test/helpers/utils';
import { rabbitMQServiceToken } from '@app/infrastructure/rabbitmq/rabbitmq.service.provider';
import { AppModule } from '@app/app.module';
import { setTimeout } from 'node:timers/promises';
import { rabbitMQProducerToken } from '@app/infrastructure/rabbitmq/rabbitmq.producer.provider';
import { ContactTaskMessenger } from '@app/infrastructure/contact-task-managers/contact.task-messenger';
import { contactTaskMessengerToken } from '@app/infrastructure/contact-task-managers/contact.task-messenger.provider';

describe('contact application tasks', () => {
    const runner = initMessagingRunnerWith([AppModule], []);

    const modules: Modules = [];
    const providers: OverridingProviders = [];

    beforeEach(async () => {
        await runner.bootstrap();
    });

    afterEach(shutdown(runner));

    it('should do...', async () => {
        const service = runner.getApplication().get(rabbitMQServiceToken);
        const contactTaskMessenger = runner
            .getApplication()
            .get<ContactTaskMessenger>(contactTaskMessengerToken);
        await contactTaskMessenger.sendRelationshipMustBeCreatedBetween(
            'test',
            'test',
        );
        await setTimeout(10);
    });
});
