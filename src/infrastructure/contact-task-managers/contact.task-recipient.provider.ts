import { AsyncLocalStorage } from 'async_hooks';
import { ContactTaskHandler } from '@infra/contact-task-handlers/contact.task-handler';
import { contactTaskHandlerToken } from '@infra/contact-task-handlers/contact.task-handler.provider';
import { ConfigService } from '@nestjs/config';
import { RabbitMQContactTaskRecipient } from '@infra/contact-task-managers/contact.task-recipient';
import { Provider } from '@nestjs/common';
import { RabbitMQService } from '@infra/rabbitmq/rabbitmq.service';
import { rabbitMQServiceToken } from '@infra/rabbitmq/rabbitmq.service.provider';
import { Store } from '@infra/async-local-storage/store';

export const contactTaskRecipientToken = 'ContactTaskRecipient';
export const contactTaskRecipientProvider: Provider = {
    inject: [
        AsyncLocalStorage,
        ConfigService,
        rabbitMQServiceToken,
        contactTaskHandlerToken,
    ],
    provide: contactTaskRecipientToken,
    useFactory: (
        als: AsyncLocalStorage<Store>,
        configService: ConfigService,
        rabbitMQService: RabbitMQService,
        contactTaskHandler: ContactTaskHandler,
    ) =>
        new RabbitMQContactTaskRecipient(
            als,
            configService,
            rabbitMQService,
            contactTaskHandler,
        ),
};
