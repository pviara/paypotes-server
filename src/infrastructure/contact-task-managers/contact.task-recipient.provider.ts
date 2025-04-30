import { ContactTaskHandler } from '@infra/contact-task-handlers/contact.task-handler';
import { contactTaskHandlerToken } from '@infra/contact-task-handlers/contact.task-handler.provider';
import { ConfigService } from '@nestjs/config';
import { RabbitMQContactTaskRecipient } from '@infra/contact-task-managers/contact.task-recipient';
import { Provider } from '@nestjs/common';
import { RabbitMQService } from '@infra/rabbitmq/rabbitmq.service';
import { rabbitMQServiceToken } from '@infra/rabbitmq/rabbitmq.service.provider';

export const contactTaskRecipientToken = 'ContactTaskRecipient';
export const contactTaskRecipientProvider: Provider = {
    inject: [ConfigService, rabbitMQServiceToken, contactTaskHandlerToken],
    provide: contactTaskRecipientToken,
    useFactory: (
        configService: ConfigService,
        rabbitMQService: RabbitMQService,
        contactTaskHandler: ContactTaskHandler,
    ) =>
        new RabbitMQContactTaskRecipient(
            configService,
            rabbitMQService,
            contactTaskHandler,
        ),
};
